# file: backend/main.py
# purpose: Main entrypoint for the FastAPI backend, setting up routing, middleware, and database initialization.
# dependencies: fastapi, uvicorn

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import Base, engine, close_neo4j
from modules.rules_engine.router import router as rules_router
from modules.rulegpt.router import router as rulegpt_router
from modules.explainability.router import router as explainability_router
from modules.compliance.router import router as compliance_router
from modules.other_agents.router import router as other_agents_router
from modules.analytics.router import router as analytics_router
from modules.simulation.router import router as simulation_router
from modules.copilot.router import router as copilot_router
import structlog

logger = structlog.get_logger()

# Initialize the application
app = FastAPI(
    title="CogniFlow AI API",
    description="Autonomous Enterprise Decision Intelligence OS",
    version="1.0.0"
)

# CORS Configuration for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev, usually specific origins in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rules_router)
app.include_router(rulegpt_router)
app.include_router(explainability_router)
app.include_router(compliance_router)
app.include_router(other_agents_router)
app.include_router(analytics_router)
app.include_router(simulation_router)
app.include_router(copilot_router)

@app.on_event("startup")
async def startup_event():
    logger.info("Initializing CogniFlow AI API")
    # Initialize SQL database schema
    Base.metadata.create_all(bind=engine)

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down CogniFlow AI API")
    close_neo4j()

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "CogniFlow AI"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
