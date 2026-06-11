import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routes.auth_routes import router as auth_router
from routes.portal_routes import router as portal_router

app = FastAPI(title="DPS Damanjodi ERP API Server")

# Configure CORS Middleware
frontend_url = os.getenv("FRONTEND_URL")
origins = [
    "http://localhost:3000",
    "http://localhost:5000",
]
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Basic Health Check
@app.get("/")
def health_check():
    return {"message": "DPS Damanjodi ERP API Server is running."}

# Register routers with their respective prefixes
app.include_router(auth_router, prefix="/api/auth")
app.include_router(portal_router, prefix="/api/portal")

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print("FastAPI Exception Handler:", exc)
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": str(exc) or "An internal server error occurred."}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
