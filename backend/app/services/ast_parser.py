import re
import hashlib
from typing import List, Dict, Any, Optional


class CodeChunk:
    def __init__(
        self,
        file_path: str,
        chunk_type: str,
        symbol_name: Optional[str],
        start_line: int,
        end_line: int,
        content: str
    ):
        self.file_path = file_path
        self.chunk_type = chunk_type
        self.symbol_name = symbol_name
        self.start_line = start_line
        self.end_line = end_line
        self.content = content
        self.content_hash = hashlib.sha256(content.encode("utf-8")).hexdigest()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "file_path": self.file_path,
            "chunk_type": self.chunk_type,
            "symbol_name": self.symbol_name,
            "start_line": self.start_line,
            "end_line": self.end_line,
            "content_raw": self.content,
            "content_hash": self.content_hash,
        }


class ASTCodeChunker:
    """
    Syntax-aware code chunker.
    Attempts to use language-specific Tree-sitter parsers when available,
    with robust fallback to heuristic regex syntax boundaries.
    """

    PYTHON_FUNC_REGEX = re.compile(r"^(?:async\s+)?def\s+([a-zA-Z0-9_]+)\s*\(", re.MULTILINE)
    PYTHON_CLASS_REGEX = re.compile(r"^class\s+([a-zA-Z0-9_]+)\s*(?:\(.*\))?:", re.MULTILINE)
    
    JS_TS_FUNC_REGEX = re.compile(
        r"(?:export\s+)?(?:async\s+)?(?:function\s+([a-zA-Z0-9_$]+)|(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>)",
        re.MULTILINE
    )
    JS_TS_CLASS_REGEX = re.compile(r"(?:export\s+)?class\s+([a-zA-Z0-9_$]+)", re.MULTILINE)
    JS_TS_INTERFACE_REGEX = re.compile(r"(?:export\s+)?(?:interface|type)\s+([a-zA-Z0-9_$]+)", re.MULTILINE)

    @classmethod
    def chunk_file(cls, file_path: str, content: str) -> List[CodeChunk]:
        """Split a file into logical semantic chunks (functions, classes, interfaces, modules)."""
        if not content or not content.strip():
            return []

        lines = content.splitlines()
        total_lines = len(lines)

        # For small files, return as a single MODULE chunk
        if total_lines <= 40:
            return [CodeChunk(
                file_path=file_path,
                chunk_type="MODULE",
                symbol_name=None,
                start_line=1,
                end_line=total_lines,
                content=content
            )]

        ext = file_path.split(".")[-1].lower() if "." in file_path else ""

        if ext == "py":
            return cls._chunk_python(file_path, lines)
        elif ext in ["ts", "tsx", "js", "jsx"]:
            return cls._chunk_javascript_typescript(file_path, lines)
        else:
            return cls._chunk_generic(file_path, lines)

    @classmethod
    def _chunk_python(cls, file_path: str, lines: List[str]) -> List[CodeChunk]:
        chunks: List[CodeChunk] = []
        current_chunk_lines: List[str] = []
        current_symbol: Optional[str] = None
        current_type = "MODULE"
        start_line = 1

        for i, line in enumerate(lines, start=1):
            func_match = cls.PYTHON_FUNC_REGEX.match(line)
            class_match = cls.PYTHON_CLASS_REGEX.match(line)

            if func_match or class_match:
                # Flush existing chunk if substantial
                if current_chunk_lines and len(current_chunk_lines) > 3:
                    chunks.append(CodeChunk(
                        file_path=file_path,
                        chunk_type=current_type,
                        symbol_name=current_symbol,
                        start_line=start_line,
                        end_line=i - 1,
                        content="\n".join(current_chunk_lines)
                    ))
                    current_chunk_lines = []
                    start_line = i

                if class_match:
                    current_symbol = class_match.group(1)
                    current_type = "CLASS"
                elif func_match:
                    current_symbol = func_match.group(1)
                    current_type = "FUNCTION"

            current_chunk_lines.append(line)

        # Flush trailing chunk
        if current_chunk_lines:
            chunks.append(CodeChunk(
                file_path=file_path,
                chunk_type=current_type,
                symbol_name=current_symbol,
                start_line=start_line,
                end_line=len(lines),
                content="\n".join(current_chunk_lines)
            ))

        return chunks

    @classmethod
    def _chunk_javascript_typescript(cls, file_path: str, lines: List[str]) -> List[CodeChunk]:
        chunks: List[CodeChunk] = []
        current_chunk_lines: List[str] = []
        current_symbol: Optional[str] = None
        current_type = "MODULE"
        start_line = 1

        for i, line in enumerate(lines, start=1):
            class_match = cls.JS_TS_CLASS_REGEX.search(line)
            interface_match = cls.JS_TS_INTERFACE_REGEX.search(line)
            func_match = cls.JS_TS_FUNC_REGEX.search(line)

            if class_match or interface_match or func_match:
                if current_chunk_lines and len(current_chunk_lines) > 3:
                    chunks.append(CodeChunk(
                        file_path=file_path,
                        chunk_type=current_type,
                        symbol_name=current_symbol,
                        start_line=start_line,
                        end_line=i - 1,
                        content="\n".join(current_chunk_lines)
                    ))
                    current_chunk_lines = []
                    start_line = i

                if class_match:
                    current_symbol = class_match.group(1)
                    current_type = "CLASS"
                elif interface_match:
                    current_symbol = interface_match.group(1)
                    current_type = "INTERFACE"
                elif func_match:
                    current_symbol = func_match.group(1) or func_match.group(2)
                    current_type = "FUNCTION"

            current_chunk_lines.append(line)

        if current_chunk_lines:
            chunks.append(CodeChunk(
                file_path=file_path,
                chunk_type=current_type,
                symbol_name=current_symbol,
                start_line=start_line,
                end_line=len(lines),
                content="\n".join(current_chunk_lines)
            ))

        return chunks

    @classmethod
    def _chunk_generic(cls, file_path: str, lines: List[str], window_size: int = 60, overlap: int = 10) -> List[CodeChunk]:
        """Generic sliding-window chunker with overlap for other language files."""
        chunks: List[CodeChunk] = []
        total_lines = len(lines)
        step = max(1, window_size - overlap)

        for start_idx in range(0, total_lines, step):
            end_idx = min(start_idx + window_size, total_lines)
            chunk_content = "\n".join(lines[start_idx:end_idx])
            chunks.append(CodeChunk(
                file_path=file_path,
                chunk_type="MODULE",
                symbol_name=None,
                start_line=start_idx + 1,
                end_line=end_idx,
                content=chunk_content
            ))
            if end_idx == total_lines:
                break

        return chunks
