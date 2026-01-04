# 🛠️ Service Provider Website

A full-stack web application that connects **customers** with **service providers** based on various categories. It features user authentication, profile management, service listings, booking requests, and real-time communication.

---

## 🚀 Features

### 👤 Authentication
- Customer & Provider registration/login
- Secure JWT-based session handling with cookies

### 🔍 Service Discovery
- Browse providers by category
- View provider profiles with detailed info

### 📞 Booking & Requests
- Customers can send service requests
- Providers receive and manage booking requests

### 💬 Real-time Chat
- Instant messaging between customer and provider using Socket.IO

### 💳 Payment Integration
- Secure checkout using **PayPal**
- Automated transaction handling and payment confirmation

### ⚙️ Admin Panel (Upcoming)
- Manage users and service data

---

## 🧩 Tech Stack

### 💻 Frontend
- React.js (Vite)
- TailwindCSS for styling
- PayPal JS SDK

### 🌐 Backend
- Node.js & Express.js
- MongoDB & Mongoose
- Socket.IO (for chat)
- Cloudinary (for image uploads)
- PayPal Checkout SDK

### 🔐 Authentication
- JSON Web Tokens (JWT)

---

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/RohitBCA456/service-provider-website.git
cd service-provider-website
```

### 2. Setup Backend
```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend/` directory and add:

```env
PORT=5000
MONGO_URL=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
CLOUD_NAME=your_cloudinary_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_APP_SECRET=your_paypal_app_secret
```

Then start the backend:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd ../Frontend
npm install
npm run dev
```

---

## 🧪 API Endpoints

### Auth Routes
- `POST /registerCustomer`
- `POST /loginCustomer`
- `POST /registerProvider`
- `POST /loginProvider`

### Profile & Services
- `PUT /updateCustomer` – update profile
- `PUT /updateProvider` – update profile
- `GET /getAllProviders` – customer browsing

### Payment & Bookings
- `POST /getPaypalClientId` – initialize PayPal order
- `POST /capturePaypalOrder` – finalize transaction
- `POST /createPaypalOrder` – book a service provider

More coming soon...

---

## 📁 Folder Structure

```
service-provider-website/
│
├── Backend/
│   ├── Controllers/
│   ├── Models/
│   ├── Routes/
│   ├── Middlewares/
│   └── server.js
│
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│
└── README.md
```

---

## ✍️ Author

**Rohit Yadav**  
🔗 [GitHub](https://github.com/RohitBCA456)

---

