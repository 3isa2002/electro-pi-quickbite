import os
import sys
from datetime import datetime, timedelta

# Ensure we can import from backend
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
import models

def run_cleanup():
    db = SessionLocal()
    try:
        print("Starting cleanup...")
        
        # 1. Keep only first 10 users (excluding admin)
        all_users = db.query(models.User).filter(models.User.role != "admin").order_by(models.User.id).all()
        users_to_delete = all_users[10:]
        
        if users_to_delete:
            user_ids_to_delete = [u.id for u in users_to_delete]
            
            # Find all orders for these users
            orders_to_delete = db.query(models.Order).filter(models.Order.user_id.in_(user_ids_to_delete)).all()
            order_ids_to_delete = [o.id for o in orders_to_delete]
            
            if order_ids_to_delete:
                # Delete order items first
                db.query(models.OrderItem).filter(models.OrderItem.order_id.in_(order_ids_to_delete)).delete(synchronize_session=False)
                # Delete orders
                db.query(models.Order).filter(models.Order.id.in_(order_ids_to_delete)).delete(synchronize_session=False)
            
            # Delete users
            db.query(models.User).filter(models.User.id.in_(user_ids_to_delete)).delete(synchronize_session=False)
            db.commit()
            print(f"Deleted {len(users_to_delete)} users and their orders.")

        # 2. Delete orders older than yesterday 00:00:00
        now = datetime.utcnow()
        yesterday = (now - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        cutoff_iso = yesterday.isoformat()
        
        # Find old orders
        old_orders = db.query(models.Order).filter(models.Order.created_at < cutoff_iso).all()
        old_order_ids = [o.id for o in old_orders]
        
        if old_order_ids:
            # Delete order items first
            db.query(models.OrderItem).filter(models.OrderItem.order_id.in_(old_order_ids)).delete(synchronize_session=False)
            # Delete old orders
            db.query(models.Order).filter(models.Order.id.in_(old_order_ids)).delete(synchronize_session=False)
            db.commit()
            print(f"Deleted {len(old_order_ids)} old orders (before {cutoff_iso}).")
            
        print("Cleanup completed successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error during cleanup: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_cleanup()
