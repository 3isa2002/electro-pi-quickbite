import os
import sys
import random
from datetime import datetime, timedelta
import bcrypt

# Ensure we can import from backend
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine
import models

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Mock Egyptian Data
NAMES = ["Ahmed Mohamed", "Mahmoud Hassan", "Ali Eissa", "Omar Tarek", "Youssef Ibrahim", "Kareem Adel", "Mostafa Kamal", "Nour El-Din", "Hassan Ali", "Amr Diab", "Sarah Samir", "Nora Adel", "Maha Youssef", "Dina Magdy", "Menna Allah", "Mai Ahmed", "Salma Hassan", "Nadine Tarek", "Fatma Ibrahim", "Aya Mohamed"]
STREETS = ["ش التحرير, الدقي", "ش جامعة الدول, المهندسين", "ش 9, المعادي", "ش عباس العقاد, مدينة نصر", "ش مكرم عبيد, مدينة نصر", "ش الهرم, الجيزة", "ش فيصل, الجيزة", "ش النيل, العجوزة", "ش الثورة, مصر الجديدة", "ش التسعين, التجمع الخامس"]

def generate_phone():
    return "01" + random.choice(["0", "1", "2", "5"]) + "".join([str(random.randint(0, 9)) for _ in range(8)])

def run_seed():
    db = SessionLocal()
    try:
        print("Cleaning up old data...")
        # Delete old order items
        db.query(models.OrderItem).delete()
        # Delete old orders
        db.query(models.Order).delete()
        # Delete non-admin users
        db.query(models.User).filter(models.User.role != "admin").delete()
        db.commit()

        print("Generating 20 mock users...")
        hashed_password = get_password_hash("pass123")
        users = []
        
        with open("../mock_accounts.txt", "w", encoding="utf-8") as f:
            f.write("=== Mock Accounts (Password: pass123) ===\n\n")
            for i in range(1, 21):
                name = NAMES[i-1]
                email = f"person{i}@quickbite.com"
                phone = generate_phone()
                address = f"{random.randint(1, 100)} {random.choice(STREETS)}, القاهرة"
                created_at = (datetime.utcnow() - timedelta(days=random.randint(0, 10))).isoformat()
                
                user = models.User(
                    name=name,
                    email=email,
                    password_hash=hashed_password,
                    role="user",
                    phone=phone,
                    address=address,
                    created_at=created_at
                )
                db.add(user)
                users.append(user)
                f.write(f"Email: {email}\nName: {name}\nPhone: {phone}\nAddress: {address}\n\n")
        
        db.commit()

        print("Fetching products...")
        products = db.query(models.Product).all()
        if not products:
            print("No products found! Please run the standard seed first.")
            return

        print("Generating realistic historical orders for the last 5 days...")
        today = datetime.utcnow()
        # 5 days: today (0), yesterday (1), ..., day 4 (4)
        for day_offset in range(5):
            date_for_order = today - timedelta(days=day_offset)
            num_orders = random.randint(5, 15) # 5 to 15 orders per day
            
            for _ in range(num_orders):
                user = random.choice(users)
                
                # Create Order
                order_status = "Delivered" if day_offset > 0 else random.choice(["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"])
                
                # Pick 1 to 4 random items
                num_items = random.randint(1, 4)
                chosen_products = random.choices(products, k=num_items)
                
                subtotal = 0.0
                order_items = []
                for p in chosen_products:
                    qty = random.randint(1, 3)
                    subtotal += p.price * qty
                    order_items.append({
                        "product_id": p.id,
                        "quantity": qty
                    })
                
                tax = round(subtotal * 0.14, 2)
                delivery = 3.50
                total = subtotal + tax + delivery

                # Randomize hour within that day
                order_time = date_for_order.replace(hour=random.randint(11, 23), minute=random.randint(0, 59))

                db_order = models.Order(
                    user_id=user.id,
                    total_amount=total,
                    subtotal=subtotal,
                    tax_amount=tax,
                    delivery_fee=delivery,
                    status=order_status,
                    payment_method=random.choice(["Online", "COD"]),
                    shipping_address=user.address,
                    shipping_phone=user.phone,
                    driver_name="محمود سائق 1" if order_status in ["Out for Delivery", "Delivered"] else None,
                    driver_phone="01123456789" if order_status in ["Out for Delivery", "Delivered"] else None,
                    created_at=order_time.isoformat()
                )
                db.add(db_order)
                db.commit()
                db.refresh(db_order)

                for item in order_items:
                    db_item = models.OrderItem(
                        order_id=db_order.id,
                        product_id=item["product_id"],
                        quantity=item["quantity"]
                    )
                    db.add(db_item)
                
                db.commit()

        print("Seeding complete! Check mock_accounts.txt for generated accounts.")

    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
