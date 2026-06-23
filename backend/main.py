from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import engine, SessionLocal
import models
from routers import auth, products, orders
from seed import seed_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup event: create tables and seed db
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()
    yield
    # Shutdown event
    pass

app = FastAPI(title="QuickBite API", lifespan=lifespan)

import os

# Configure CORS for Next.js frontend
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(orders.admin_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to QuickBite API"}
