import re
from typing import List, Dict, Any, Optional
from app.schemas.rca import ParsedStackFrame


class StackTraceParser:
    """
    Robust multi-language stack trace parser supporting Python, JS/TS (Node & Browser),
    Go, Java, and Rust error logs.
    """

    # 1. Python: File "/path/to/file.py", line 123, in function_name
    PYTHON_FRAME_RE = re.compile(
        r'File\s+["\'](?P<file>[^"\']+)["\'],\s+line\s+(?P<line>\d+)(?:,\s+in\s+(?P<func>[a-zA-Z0-9_<>\.]+))?'
    )

    # 2. JavaScript / TypeScript (Node.js & V8): at FunctionName (/path/to/file.ts:123:45) OR at /path/to/file.ts:123:45
    JS_V8_FRAME_RE = re.compile(
        r'^\s*at\s+(?:(?P<func>[a-zA-Z0-9_$.<>\[\]\s]+?)\s+\()?(?P<file>[a-zA-Z0-9_/\.\-@\\]+\.[a-zA-Z0-9]+):(?P<line>\d+)(?::(?P<col>\d+))?\)?',
        re.MULTILINE
    )

    # 3. JavaScript / TypeScript (WebKit / Safari / Firefox): funcName@/path/to/file.js:123:45
    JS_WEBKIT_FRAME_RE = re.compile(
        r'^\s*(?:(?P<func>[a-zA-Z0-9_$.]+)@)?(?P<file>[a-zA-Z0-9_/\.\-@\\]+\.[a-zA-Z0-9]+):(?P<line>\d+)(?::(?P<col>\d+))?',
        re.MULTILINE
    )

    # 4. Java: at com.company.package.Class.method(Class.java:123)
    JAVA_FRAME_RE = re.compile(
        r'^\s*at\s+(?P<func>[a-zA-Z0-9_$.]+)\((?P<file>[a-zA-Z0-9_]+\.java):(?P<line>\d+)\)',
        re.MULTILINE
    )

    # 5. Go Panic: /path/to/file.go:123 +0x1a2
    GO_FRAME_RE = re.compile(
        r'^\s*(?P<file>[a-zA-Z0-9_/\.\-]+\.go):(?P<line>\d+)(?:\s+\+0x[0-9a-fA-F]+)?',
        re.MULTILINE
    )

    # 6. Rust: at src/main.rs:123:5
    RUST_FRAME_RE = re.compile(
        r'^\s*\d+:\s+(?P<func>[a-zA-Z0-9_:]+)\s*\n\s*at\s+(?P<file>[a-zA-Z0-9_/\.\-]+\.rs):(?P<line>\d+)(?::(?P<col>\d+))?',
        re.MULTILINE
    )

    # Common Error Headers
    ERROR_HEADER_RE = re.compile(
        r'^(?P<type>[A-Za-z0-9_]+Error|[A-Za-z0-9_]+Exception|panic|Error|FATAL):\s*(?P<msg>.*)$',
        re.MULTILINE
    )

    @classmethod
    def parse(cls, raw_trace: str) -> Dict[str, Any]:
        """
        Parse raw trace text into structured frames, error type, and error message.
        """
        if not raw_trace or not raw_trace.strip():
            return {
                "error_type": "UnknownError",
                "error_message": "Empty stack trace provided",
                "frames": []
            }

        error_type, error_message = cls._extract_error_header(raw_trace)
        frames: List[ParsedStackFrame] = []

        # Try parsing line-by-line or regex passes
        frames.extend(cls._parse_python(raw_trace))
        if not frames:
            frames.extend(cls._parse_javascript(raw_trace))
        if not frames:
            frames.extend(cls._parse_java(raw_trace))
        if not frames:
            frames.extend(cls._parse_go(raw_trace))
        if not frames:
            frames.extend(cls._parse_rust(raw_trace))

        # Filter and normalize paths
        normalized_frames = cls._normalize_frames(frames)

        return {
            "error_type": error_type,
            "error_message": error_message,
            "frames": normalized_frames
        }

    @classmethod
    def _extract_error_header(cls, trace: str) -> tuple[str, str]:
        """Extract top-level error name and description."""
        match = cls.ERROR_HEADER_RE.search(trace)
        if match:
            return match.group("type").strip(), match.group("msg").strip()

        # Fallback: check first line
        lines = [line.strip() for line in trace.splitlines() if line.strip()]
        if lines:
            first_line = lines[0]
            if ":" in first_line:
                parts = first_line.split(":", 1)
                return parts[0].strip(), parts[1].strip()
            return "RuntimeError", first_line

        return "RuntimeError", "An unexpected error occurred"

    @classmethod
    def _parse_python(cls, trace: str) -> List[ParsedStackFrame]:
        frames = []
        for match in cls.PYTHON_FRAME_RE.finditer(trace):
            frames.append(ParsedStackFrame(
                file_path=match.group("file"),
                line_number=int(match.group("line")),
                column_number=None,
                function_name=match.group("func"),
                raw_frame_text=match.group(0).strip()
            ))
        return frames

    @classmethod
    def _parse_javascript(cls, trace: str) -> List[ParsedStackFrame]:
        frames = []
        for match in cls.JS_V8_FRAME_RE.finditer(trace):
            frames.append(ParsedStackFrame(
                file_path=match.group("file"),
                line_number=int(match.group("line")),
                column_number=int(match.group("col")) if match.group("col") else None,
                function_name=match.group("func").strip() if match.group("func") else None,
                raw_frame_text=match.group(0).strip()
            ))
        if not frames:
            for match in cls.JS_WEBKIT_FRAME_RE.finditer(trace):
                frames.append(ParsedStackFrame(
                    file_path=match.group("file"),
                    line_number=int(match.group("line")),
                    column_number=int(match.group("col")) if match.group("col") else None,
                    function_name=match.group("func").strip() if match.group("func") else None,
                    raw_frame_text=match.group(0).strip()
                ))
        return frames

    @classmethod
    def _parse_java(cls, trace: str) -> List[ParsedStackFrame]:
        frames = []
        for match in cls.JAVA_FRAME_RE.finditer(trace):
            frames.append(ParsedStackFrame(
                file_path=match.group("file"),
                line_number=int(match.group("line")),
                column_number=None,
                function_name=match.group("func"),
                raw_frame_text=match.group(0).strip()
            ))
        return frames

    @classmethod
    def _parse_go(cls, trace: str) -> List[ParsedStackFrame]:
        frames = []
        for match in cls.GO_FRAME_RE.finditer(trace):
            frames.append(ParsedStackFrame(
                file_path=match.group("file"),
                line_number=int(match.group("line")),
                column_number=None,
                function_name=None,
                raw_frame_text=match.group(0).strip()
            ))
        return frames

    @classmethod
    def _parse_rust(cls, trace: str) -> List[ParsedStackFrame]:
        frames = []
        for match in cls.RUST_FRAME_RE.finditer(trace):
            frames.append(ParsedStackFrame(
                file_path=match.group("file"),
                line_number=int(match.group("line")),
                column_number=int(match.group("col")) if match.group("col") else None,
                function_name=match.group("func"),
                raw_frame_text=match.group(0).strip()
            ))
        return frames

    @classmethod
    def _normalize_frames(cls, frames: List[ParsedStackFrame]) -> List[ParsedStackFrame]:
        """Strip internal system paths (/node_modules/, /usr/lib/, site-packages/) and normalize."""
        cleaned: List[ParsedStackFrame] = []
        for frame in frames:
            path = frame.file_path.replace("\\", "/")
            # Filter out standard libraries / internal modules
            if "/node_modules/" in path or "site-packages/" in path or path.startswith("<internal"):
                continue

            # Strip absolute prefixes if present to make relative
            if "/app/" in path:
                path = path.split("/app/", 1)[1]
            elif "/src/" in path and not path.startswith("src/"):
                path = "src/" + path.split("/src/", 1)[1]

            cleaned.append(ParsedStackFrame(
                file_path=path,
                line_number=frame.line_number,
                column_number=frame.column_number,
                function_name=frame.function_name,
                raw_frame_text=frame.raw_frame_text
            ))
        return cleaned or frames
