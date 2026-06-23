from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional
from enum import Enum

class RoleEnum(str, Enum):
    user = "user"
    admin = "admin"

class OrderStatusEnum(str, Enum):
    Pending = "Pending"
    Preparing = "Preparing"
    OutForDelivery = "Out for Delivery"
    Delivered = "Delivered"
    Cancelled = "Cancelled"

class PaymentMethodEnum(str, Enum):
    Online = "Online"
    COD = "COD"

# --- User Schemas ---
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str
    address: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    phone: str
    address: str
    
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Product Schemas ---
class ProductBase(BaseModel):
    name_en: str
    name_ar: str
    description_en: str
    description_ar: str
    price: float
    image_url: str
    category: str
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)

# --- Order Schemas ---
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    payment_method: PaymentMethodEnum
    items: List[OrderItemCreate]
    shipping_address: str
    shipping_phone: str

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductResponse
    
    model_config = ConfigDict(from_attributes=True)

class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_amount: float
    status: str
    payment_method: str
    shipping_address: Optional[str] = None
    shipping_phone: Optional[str] = None
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    items: List[OrderItemResponse]
    
    model_config = ConfigDict(from_attributes=True)

class OrderStatusUpdate(BaseModel):
    status: OrderStatusEnum
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
