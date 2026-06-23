# QuickBite (كويك بايت) 🍔🚀

QuickBite is a modern, responsive, and fully featured food delivery web application built with a scalable **FastAPI** backend and an interactive **Next.js** frontend. 

It features multilingual support (English & Arabic), a complete e-commerce flow (cart, checkout, tracking), and a dedicated Admin Dashboard to manage orders, assignments, and deliveries.

---

## ✨ Features

### Customer Experience
- **Multilingual UI:** Seamless toggling between English (LTR) and Arabic (RTL).
- **Modern Design:** Built with Tailwind CSS v4 and Framer Motion for smooth animations and a premium look.
- **Cart & Checkout:** Add products to cart, specify shipping details, and place orders.
- **Order Tracking:** Track real-time order status and cancel pending orders.
- **User Authentication:** Secure JWT-based login and registration.

### Admin Dashboard
- **Order Management:** View all orders, update statuses (Pending, Preparing, Out for Delivery, Delivered, Cancelled).
- **Driver Assignment:** Inline, native native selection interface to assign delivery drivers.
- **Analytics:** Real-time revenue and active order statistics.
- **Localization:** Admin panel is fully localized and easily toggled between EN/AR.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Internationalization:** next-intl
- **State Management:** React Context API

### Backend
- **Framework:** FastAPI (Python)
- **Database:** SQLite (Local) / PostgreSQL (Production)
- **ORM:** SQLAlchemy
- **Authentication:** JWT (JSON Web Tokens) with passlib/bcrypt
- **Migrations:** Automated schema updates on startup

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.9 or higher)

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *The backend will run at `http://localhost:8000` and automatically create the SQLite database.*

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Copy `.env.example` to `.env.local` and specify your backend URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend will be available at `http://localhost:3000`.*

---

## 📁 Project Structure

```text
electro-pi-task/
├── backend/
│   ├── main.py            # FastAPI application entry point & DB migrations
│   ├── models.py          # SQLAlchemy database models
│   ├── schemas.py         # Pydantic validation schemas
│   ├── routers/           # API Endpoints (auth, products, orders, admin)
│   └── utils/             # Helper functions (JWT, hashing)
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js App Router (Pages & Layouts)
│   │   ├── components/    # Reusable React components (UI, Admin, Cart)
│   │   ├── context/       # React Contexts (CartContext)
│   │   ├── i18n/          # next-intl configuration & routing
│   │   └── messages/      # Localization dictionaries (en.json, ar.json)
│   ├── tailwind.config.ts # Tailwind styling configuration
│   └── next.config.ts     # Next.js configuration
└── README.md
```

## 🌐 Deployment
- The backend is configured to be deployed easily on **Render** (Procfile/uvicorn).
- The frontend is optimized for **Vercel**. Ensure to set `NEXT_PUBLIC_API_URL` to your production backend domain.
