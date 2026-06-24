import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DIRECT_URL") or os.getenv("DATABASE_URL")

# Create SQLAlchemy Engine
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def row_to_dict(row):
    """Helper to convert a single SQLAlchemy Mapping row to a dict"""
    if row is None:
        return None
    return dict(row)

def rows_to_list(rows):
    """Helper to convert a list of SQLAlchemy Mapping rows to a list of dicts"""
    return [dict(r) for r in rows]
