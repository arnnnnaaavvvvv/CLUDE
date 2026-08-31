import time
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine, Base
from app.core.redis import check_rate_limit
from app.api.v1.repos import router as repos_router
from app.api.v1.webhooks import router as webhooks_router
from app.api.v1.rca import router as rca_router
from app.api.v1.onboarding import router as onboarding_router

# Setup Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("clude_api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure pgvector extension and create tables if not present
    logger.info("Initializing database tables and vector extensions...")
    async with engine.begin() as conn:
        try:
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
        except Exception as e:
            logger.warning(f"Note on vector extension initialization: {e}")
        await conn.run_sync(Base.metadata.create_all)
    logger.info("CLUDE Backend initialized successfully.")
    yield
    # Shutdown
    await engine.dispose()
    logger.info("CLUDE Backend shutdown completed.")


app = FastAPI(
    title=settings.APP_NAME,
    description="Unified AI Code Intelligence Platform for Root-Cause Analysis & Codebase Onboarding",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# 1. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 2. Rate Limiting & Request Logging Middleware
@app.middleware("http")
async def request_timing_and_rate_limit_middleware(request: Request, call_next):
    start_time = time.time()
    client_ip = request.client.host if request.client else "127.0.0.1"

    # Rate Limiter check (skip for healthcheck and docs)
    if not request.url.path.startswith(("/docs", "/openapi.json", "/health")):
        allowed = await check_rate_limit(f"ip:{client_ip}", limit=settings.RATE_LIMIT_PER_MINUTE)
        if not allowed:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Too many requests. Rate limit exceeded. Please wait a minute."}
            )

    response = await call_next(request)
    duration_ms = round((time.time() - start_time) * 1000, 2)
    logger.info(f"{request.method} {request.url.path} -> {response.status_code} ({duration_ms}ms)")
    response.headers["X-Process-Time-Ms"] = str(duration_ms)
    return response


# 3. Global Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error on {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Unprocessable Entity",
            "message": "Input validation failed. Please check payload fields.",
            "details": exc.errors()
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred processing your request."
        }
    )


# 4. Include Routers
app.include_router(repos_router, prefix=settings.API_V1_STR)
app.include_router(webhooks_router, prefix=settings.API_V1_STR)
app.include_router(rca_router, prefix=settings.API_V1_STR)
app.include_router(onboarding_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "service": "clude-backend", "timestamp": time.time()}
