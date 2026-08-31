import hashlib
import hmac
import base64
from datetime import datetime, timedelta, timezone
from typing import Optional, Any
from jose import jwt, JWTError
from cryptography.fernet import Fernet
from app.core.config import settings

# 32-byte url-safe base64 key derivation for AES encryption of OAuth tokens
derived_key = base64.urlsafe_b64encode(
    hashlib.sha256(settings.SECRET_KEY.encode()).digest()
)
fernet_cipher = Fernet(derived_key)


def encrypt_token(plain_token: str) -> str:
    """Encrypt sensitive OAuth tokens at rest using AES-CBC/Fernet."""
    if not plain_token:
        return ""
    return fernet_cipher.encrypt(plain_token.encode()).decode()


def decrypt_token(encrypted_token: str) -> str:
    """Decrypt sensitive OAuth token."""
    if not encrypted_token:
        return ""
    return fernet_cipher.decrypt(encrypted_token.encode()).decode()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")


def verify_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except JWTError:
        return None


def verify_github_signature(payload_body: bytes, signature_header: Optional[str], secret: Optional[str]) -> bool:
    """Validate GitHub webhook HMAC-SHA256 signature."""
    if not secret or not signature_header:
        return True # In development with no secret set
    
    if not signature_header.startswith("sha256="):
        return False
        
    expected_signature = signature_header[7:]
    mac = hmac.new(secret.encode("utf-8"), msg=payload_body, digestmod=hashlib.sha256)
    computed_signature = mac.hexdigest()
    return hmac.compare_digest(expected_signature, computed_signature)
