# 🛠️ Service Provider Website

A full-stack web application that connects **customers** with **service providers** across various categories. It supports user authentication, real-time chat, service management, bookings, PayPal payments, and location-based provider discovery — all containerized with Docker.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Setup (Manual)](#local-setup-manual)
  - [Docker Setup](#docker-setup)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Pages & Components](#-pages--components)
- [Author](#-author)

---

## ✨ Features

### 👤 Authentication
- Unified registration and login for both customers and providers
- JWT-based session management with HTTP-only cookies
- Google OAuth integration
- Avatar upload via Cloudinary + Multer

### 🔍 Service Discovery
- Browse and filter nearby service providers by category
- View detailed provider profiles including services, ratings, and availability
- Location-aware provider listing

### 📅 Booking System
- Customers can book providers directly from their profile
- Providers can accept or reject booking requests
- Booking status tracking and history
- Rating system after service completion

### 💬 Real-Time Chat
- Instant messaging between customer and provider via **Socket.IO**
- Persistent chat history stored in MongoDB
- Redis-cached latest messages for performance
- Unread message count and mark-as-read functionality

### 💳 Payment Integration
- Secure checkout with **PayPal** (orders, capture, client ID fetch)
- Payment-gated booking confirmation

### 📊 Analytics Dashboard (Provider)
- Booking statistics and chart data via Recharts
- Service pair management (add, update, delete)

### 📧 Contact & Notifications
- Contact form with email delivery via **Resend**
- Web push notifications via **web-push** (VAPID)

---

## 🧩 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework & bundler |
| React Router DOM v7 | Client-side routing |
| Tailwind CSS v4 | Utility-first styling |
| Framer Motion | Animations |
| Socket.IO Client | Real-time messaging |
| @paypal/react-paypal-js | PayPal checkout |
| Recharts | Analytics charts |
| Axios | HTTP client |
| React Hot Toast | Notifications |
| Lucide React / React Icons | Icon libraries |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | Server & REST API |
| MongoDB + Mongoose | Primary database |
| Redis | Chat message caching |
| Socket.IO | Real-time WebSocket server |
| Cloudinary + Multer | Image upload & storage |
| JWT + bcrypt | Auth & password hashing |
| PayPal Checkout SDK | Payment processing |
| Razorpay | Alternative payment gateway |
| Resend | Transactional emails |
| web-push | Browser push notifications |
| Google Auth Library | OAuth support |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Containerization |
| Vercel | Frontend deployment |
| MongoDB Atlas | Cloud database |

---

## 📁 Project Structure

```
service-provider-website/
│
├── Backend/
│   ├── Controllers/
│   │   ├── Auth.Controller.js       # Register, login, chat history, contact mail
│   │   ├── Booking.Controller.js    # Book, PayPal orders, ratings, stats
│   │   ├── Customer.Controller.js   # Profile update, logout
│   │   └── Provider.Controller.js   # Profile, nearby providers, services
│   │
│   ├── Routers/
│   │   ├── Auth.Router.js
│   │   ├── Booking.Router.js
│   │   ├── Customer.Router.js
│   │   └── Provider.Router.js
│   │
│   ├── Models/
│   │   ├── User.Model.js
│   │   ├── Booking.Model.js
│   │   └── Message.Model.js
│   │
│   ├── Middlewares/
│   │   ├── Auth.Middleware.js       # JWT verification
│   │   └── Multer.Middleware.js     # File upload handling
│   │
│   ├── utilities/
│   │   └── Socket.utility.js        # Socket.IO initialization & events
│   │
│   ├── config/
│   │   └── redis.config.js
│   │
│   ├── app.js                       # Express app setup
│   ├── server.js                    # HTTP server entry point
│   └── Dockerfile
│
├── Frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── ProviderHome.jsx
│   │   │   ├── ListProviders.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── ChatUi.jsx
│   │   │   ├── AddServicePage.jsx
│   │   │   ├── ManageService.jsx
│   │   │   ├── TableList.jsx
│   │   │   └── updateProfilePage.jsx
│   │   │
│   │   ├── components/
│   │   │   ├── Header.jsx / Footer.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Login.jsx / SignUp.jsx
│   │   │   ├── Cards.jsx
│   │   │   ├── ChatMenu.jsx
│   │   │   ├── AddServiceForm.jsx
│   │   │   ├── UpdateService.jsx
│   │   │   ├── GraphProvider.jsx
│   │   │   ├── FeaturesProvider.jsx
│   │   │   ├── ListProvidersPage.jsx
│   │   │   ├── Pricing.jsx
│   │   │   ├── ContactUs.jsx
│   │   │   └── Loader.jsx / ErrorBoundary.jsx
│   │   │
│   │   ├── Socket.js                # Socket.IO client config
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── vercel.json
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** v9+
- **MongoDB** (local or Atlas)
- **Redis** (local or cloud)
- **Docker** (optional, for containerized setup)

---

### Local Setup (Manual)

#### 1. Clone the Repository

```bash
git clone https://github.com/RohitBCA456/service-provider-website.git
cd service-provider-website
```

#### 2. Setup the Backend

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend/` directory (see [Environment Variables](#-environment-variables)), then run:

```bash
npm start
```

The backend will start on `http://localhost:5000` (or whichever port you set).

#### 3. Setup the Frontend

```bash
cd ../Frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`.

---

### Docker Setup

Run the entire stack (backend + frontend + MongoDB) with a single command:

```bash
docker-compose up --build
```

| Service   | Port  |
|-----------|-------|
| Backend   | 3000  |
| Frontend  | 3001  |
| MongoDB   | 27017 |

---

## 🔐 Environment Variables

Create a `.env` file inside the `Backend/` directory with the following keys:

```env
# Server
PORT=5000
ORIGIN=http://localhost:5173

# Database
MONGO_URL=your_mongodb_connection_string

# Auth
JWT_SECRET=your_jwt_secret

# Cloudinary
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_APP_SECRET=your_paypal_app_secret

# Razorpay (optional)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Redis
REDIS_URL=your_redis_url

# Resend (Email)
RESEND_API_KEY=your_resend_api_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# Web Push (VAPID)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

> 💡 Run `node generateVAPIDKeys.js` inside `Backend/` to generate your VAPID keys.

---

## 📡 API Reference

All routes are prefixed with `/api/v1`. Routes marked with 🔒 require a valid JWT cookie.

### Auth — `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/registerUser` | ❌ | Register customer or provider (with avatar) |
| POST | `/login` | ❌ | Login and receive JWT cookie |
| GET | `/fetchUserRole` | 🔒 | Get the role of the current user |
| GET | `/getCurrentUser` | 🔒 | Get full profile of the logged-in user |
| GET | `/getUserDetails/:userId` | ❌ | Get public profile of any user |
| GET | `/getChatHistory/:roomId` | ❌ | Fetch messages for a chat room |
| GET | `/getUnreadMessageCount` | 🔒 | Count unread messages |
| POST | `/markAsRead` | ❌ | Mark messages in a room as read |
| POST | `/sendEmail` | ❌ | Send a contact form email |

### Customers — `/api/v1/customers`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| PUT | `/updateCustomer` | 🔒 | Update customer profile (with avatar) |
| GET | `/logoutCustomer` | 🔒 | Logout and clear session cookie |

### Providers — `/api/v1/providers`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| PUT | `/updateProvider` | 🔒 | Update provider profile (with avatar) |
| GET | `/getProvider/:providerId` | ❌ | Get a single provider's details |
| GET | `/getAllNearByProviders` | 🔒 | List nearby providers for a customer |
| GET | `/logoutProvider` | 🔒 | Logout and clear session cookie |
| PUT | `/updateServicePairs` | 🔒 | Update a service and price pair |
| DELETE | `/deleteServicePairs` | 🔒 | Remove a service and price pair |

### Bookings — `/api/v1/booking`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/bookProvider` | 🔒 | Create a booking request |
| POST | `/getBookingStatus` | 🔒 | Check status of a booking |
| GET | `/getBookingStats` | 🔒 | Fetch booking stats for dashboard |
| PUT | `/updateStatus/:id` | 🔒 | Accept or reject a booking |
| POST | `/submitRating` | ❌ | Submit a rating for a provider |
| GET | `/getPaypalClientId` | ❌ | Retrieve PayPal client ID |
| POST | `/createPaypalOrder` | 🔒 | Create a PayPal order for booking |
| POST | `/capturePaypalOrder` | 🔒 | Capture and confirm a PayPal payment |
| GET | `/getBookingChartData` | 🔒 | Get chart data for analytics |

---

## 🖥️ Pages & Components

### Pages

| Page | Description |
|------|-------------|
| `Home` | Customer landing page with hero, features, and pricing |
| `ProviderHome` | Provider dashboard with stats, chart, and bookings table |
| `ListProviders` | Browsable list of nearby service providers |
| `ProfilePage` | Public profile view of a provider |
| `ChatUi` | Real-time chat interface |
| `AddServicePage` | Provider page to add new services |
| `ManageService` | Provider page to update or delete services |
| `TableList` | Tabular view of bookings |
| `updateProfilePage` | Edit personal profile details |

### Key Components

| Component | Description |
|-----------|-------------|
| `Header` / `Footer` | Site-wide navigation and footer |
| `Hero` | Landing page hero section |
| `Login` / `SignUp` | Auth forms for customers and providers |
| `Cards` | Provider listing cards |
| `ChatMenu` | Sidebar chat contacts list |
| `GraphProvider` | Recharts booking analytics graph |
| `AddServiceForm` | Form for adding service/price pairs |
| `UpdateService` | Inline service editing form |
| `Pricing` | Pricing tier display component |
| `ContactUs` | Contact form with email submission |
| `ErrorBoundary` | Global React error boundary |

---

## ✍️ Author

**Rohit Yadav**
🔗 [GitHub — @RohitBCA456](https://github.com/RohitBCA456)

---

> ⚙️ *Admin Panel is currently under development.*