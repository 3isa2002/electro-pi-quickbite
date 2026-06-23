from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models
import schemas
from dependencies import get_admin_user

router = APIRouter(prefix="/api/products", tags=["products"])

@router.get("/", response_model=List[schemas.ProductResponse])
def get_products(
    category: Optional[str] = None, 
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Product)
    
    if category and category.lower() != "all":
        query = query.filter(models.Product.category == category)
        
    if is_active is not None:
        query = query.filter(models.Product.is_active == is_active)
        
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (models.Product.name_en.ilike(search_term)) | 
            (models.Product.name_ar.ilike(search_term)) |
            (models.Product.description_en.ilike(search_term)) |
            (models.Product.description_ar.ilike(search_term))
        )
        
    return query.all()

@router.post("/", response_model=schemas.ProductResponse)
def create_product(
    product: schemas.ProductCreate, 
    db: Session = Depends(get_db), 
    admin: models.User = Depends(get_admin_user)
):
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.put("/{product_id}", response_model=schemas.ProductResponse)
def update_product(
    product_id: int,
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in product.model_dump().items():
        setattr(db_product, key, value)
        
    db.commit()
    db.refresh(db_product)
    return db_product

@router.patch("/{product_id}/toggle-active", response_model=schemas.ProductResponse)
def toggle_product_active(
    product_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db_product.is_active = not db_product.is_active
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    db.delete(db_product)
    db.commit()
    return {"detail": "Product deleted successfully"}
