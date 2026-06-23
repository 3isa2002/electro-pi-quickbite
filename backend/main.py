from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import engine, SessionLocal
import models
from routers import auth, products, orders
from seed import seed_db

def run_migrations(engine):
    """Safely add new columns if they don't exist (manual migration)."""
    with engine.connect() as conn:
        from sqlalchemy import text, inspect
        inspector = inspect(engine)
        existing_columns = [col['name'] for col in inspector.get_columns('orders')]
        
        if 'driver_name' not in existing_columns:
            conn.execute(text("ALTER TABLE orders ADD COLUMN driver_name VARCHAR"))
            conn.commit()
        
        if 'driver_phone' not in existing_columns:
            conn.execute(text("ALTER TABLE orders ADD COLUMN driver_phone VARCHAR"))
            conn.commit()
            
        if 'subtotal' not in existing_columns:
            conn.execute(text("ALTER TABLE orders ADD COLUMN subtotal FLOAT DEFAULT 0.0"))
            conn.commit()
            
        if 'tax_amount' not in existing_columns:
            conn.execute(text("ALTER TABLE orders ADD COLUMN tax_amount FLOAT DEFAULT 0.0"))
            conn.commit()
            
        if 'delivery_fee' not in existing_columns:
            conn.execute(text("ALTER TABLE orders ADD COLUMN delivery_fee FLOAT DEFAULT 0.0"))
            conn.commit()

        if 'created_at' not in existing_columns:
            conn.execute(text("ALTER TABLE orders ADD COLUMN created_at VARCHAR"))
            conn.commit()

        user_columns = [col['name'] for col in inspector.get_columns('users')]
        if 'created_at' not in user_columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN created_at VARCHAR"))
            conn.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup event: create tables and seed db
    models.Base.metadata.create_all(bind=engine)
    # Run manual migrations to add new columns
    try:
        run_migrations(engine)
    except Exception as e:
        print(f"Migration warning: {e}")
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
origins = [
    frontend_url,
    "https://electro-pi-quickbite.vercel.app",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(orders.admin_router)

@app.get("/seed-history")
def seed_historical_data():
    import seed_history
    try:
        seed_history.run_seed()
        return {"status": "success", "message": "Historical data seeded successfully on Render DB!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/")
def read_root():
    return {"message": "Welcome to QuickBite API"}
