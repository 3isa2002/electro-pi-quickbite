from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas
from dependencies import get_current_user, get_admin_user

router = APIRouter(prefix="/api/orders", tags=["orders"])
admin_router = APIRouter(prefix="/api/admin/orders", tags=["admin-orders"])

@router.post("/", response_model=schemas.OrderResponse)
def create_order(
    order: schemas.OrderCreate, 
    db: Session = Depends(get_db), 
    user: models.User = Depends(get_current_user)
):
    subtotal = 0.0
    for item in order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with id {item.product_id} not found")
        subtotal += product.price * item.quantity

    tax_amount = round(subtotal * 0.14, 2)
    delivery_fee = 3.50
    total_amount = subtotal + tax_amount + delivery_fee

    db_order = models.Order(
        user_id=user.id,
        total_amount=total_amount,
        subtotal=subtotal,
        tax_amount=tax_amount,
        delivery_fee=delivery_fee,
        payment_method=order.payment_method.value,
        shipping_address=order.shipping_address,
        shipping_phone=order.shipping_phone
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    for item in order.items:
        db_order_item = models.OrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            quantity=item.quantity
        )
        db.add(db_order_item)
    
    db.commit()
    db.refresh(db_order)
    return db_order

@router.get("/my-orders", response_model=List[schemas.OrderResponse])
def get_my_orders(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    return db.query(models.Order).filter(
        models.Order.user_id == user.id
    ).order_by(models.Order.id.desc()).all()

@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(
    order_id: int, 
    db: Session = Depends(get_db), 
    user: models.User = Depends(get_current_user)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
    return order

@router.put("/{order_id}/cancel", response_model=schemas.OrderResponse)
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if order.status != "Pending":
        raise HTTPException(status_code=400, detail="Cannot cancel order that is already being prepared or delivered")
    order.status = "Cancelled"
    db.commit()
    db.refresh(order)
    return order

@admin_router.get("/", response_model=List[schemas.OrderResponse])
def get_all_orders(
    db: Session = Depends(get_db), 
    admin: models.User = Depends(get_admin_user)
):
    return db.query(models.Order).all()

@admin_router.put("/{order_id}/status", response_model=schemas.OrderResponse)
def update_order_status(
    order_id: int, 
    status_update: schemas.OrderStatusUpdate, 
    db: Session = Depends(get_db), 
    admin: models.User = Depends(get_admin_user)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = status_update.status.value
    if status_update.driver_name is not None:
        order.driver_name = status_update.driver_name
    if status_update.driver_phone is not None:
        order.driver_phone = status_update.driver_phone
        
    db.commit()
    db.refresh(order)
    return order
