# file: src/modules/core/database.py
# purpose: Handles connection pooling for PostgreSQL (SQLAlchemy) and Neo4j.
# dependencies: sqlalchemy, neo4j

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from neo4j import GraphDatabase, Driver
from .config import settings

# --- PostgreSQL Setup ---
engine = create_engine(settings.SQLALCHEMY_DATABASE_URI, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Neo4j Setup ---
neo4j_driver: Driver = GraphDatabase.driver(
    settings.NEO4J_URI,
    auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
)

def get_neo4j_session():
    session = neo4j_driver.session()
    try:
        yield session
    finally:
        session.close()

def close_neo4j():
    neo4j_driver.close()
