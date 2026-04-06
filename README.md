# Inventory Management System (IMS)

A full-stack, comprehensive web application built with the **MERN (MySQL, Express, React, Node.js) stack**. This system is specifically tailored to manage IT hardware assets such as PCs, laptops, and networking equipment. It allows organizations to effectively track assets, monitor stock levels, handle procurement/distribution via orders, and manage staff access.

## ✨ Features

### 🔐 Authentication & Role-Based Access Control (RBAC)
- **Secure Authentication:** Implementation of JWT-based authentication and secure password hashing using `bcrypt`.
- **Admin vs. Staff Roles:** Disjoint environments. Admins have complete control over procurement, personnel management, and system overview. Staff have limited permissions—mostly tracking their assigned assets and monitoring immediate hardware availability.
- **Role-based Routing:** Dynamic React routing checking credentials to render role-targeted Dashboards (`Dashboard` vs `StaffDashboard`).

### 📦 Asset & Product Management
- **Hardware Profile Tracking:** Records granular details including Name, Description, SKU, Price, Cost, Category, Stock Level, Status (Available, In Use, Maintenance), and Assigned Personnel.
- **Supplier Relationship Mapping:** Track supplier profiles, communications, details, and products originated from specific suppliers for streamlined procurement processes.

### 🛒 Ordering System
- **Purchase and Sales Workflows:** Handle the procurement of new IT shipments and the assignment out (Sales/Distribution) of hardware assets.
- **Automated Inventory Adjustments:** Through advanced MySQL Triggers and Stored Procedures, stock levels dynamically update and automatically insert into `inventory_logs` when orders are processed.

### 📊 Dashboard & Analytics
- **At-a-Glance Metrics:** Visualize total stock allocations, identify low-stock critical items with threshold alerts, and summarize supplier relationships.
- **Interactive Charts:** Powered by `recharts` to render informative, responsive visual components on overall inventory health.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19 (via Vite)
- **Styling:** Tailwind CSS (Modern functional utility styles) 
- **Icons & Visuals:** `lucide-react`, `recharts`
- **State & Routing:** `react-router-dom`, React Context API
- **Utilities:** `axios` for HTTP, `react-hot-toast` for rich Toast notifications.

### Backend
- **Core Environment:** Node.js, Express.js
- **Database:** MySQL relational DB leveraging `mysql2` driver (schema incorporates Foreign Constraints, Triggers, and Stored Procedures natively).
- **Security:** `express-rate-limit`, `bcrypt`, `jsonwebtoken` (JWT), `express-validator`.
- **File Uploads:** `multer` (for handling local asset images upload).

---

## 🚀 Setup & Installation

Follow these steps to deploy the application on your local machine.

### Prerequisites
- Node.js (v16+ recommended)
- MySQL Server (must be running on your local machine or a remote database service)
- `npm` or `yarn`

### 1. Database Configuration
The project includes a robust SQL schema located at `Backend/db/schema.sql`.

1. Start your MySQL Server.
2. Ensure you have the `ims_db` created or simply run the setup scripts. 
3. You can execute `Backend/db/schema.sql` directly into your MySQL client, or run the backend database migration scripts if provided (e.g., `check_db.js`, `run_migration.js`).

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install necessary dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Create a `.env` file in the root of the `Backend/` folder. Add the following:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=ims_db
   JWT_SECRET=super_secret_jwt_key
   ```
4. Start the Application:
   ```bash
   npm start
   ```
   *The server should now be running locally, typically defaulting to `http://localhost:5000`.*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Development Server:
   ```bash
   npm run dev
   ```
   *The Vite development server will start, typically accessible at `http://localhost:5173`.*

---

## 🏗️ Project Structure

```text
📦 Inventory_Management_System_-IMS-
├── 📂 Backend/
│   ├── 📂 controllers/   # Request handling logic (Auth, Users, Products, Orders)
│   ├── 📂 db/            # MySQL schema files (`schema.sql`) and database connection code
│   ├── 📂 middleware/    # Express middleware (Auth validation, Error handling)
│   ├── 📂 routes/        # API route definitions
│   ├── 📂 uploads/       # Storage directory for graphical assets/images via Multer
│   └── 📄 server.js      # Main Express application entry point
├── 📂 frontend/    
│   ├── 📂 src/
│   │   ├── 📂 components/# Reusable UI components (Modals, Tables, ProtectectedRoute wrapper)
│   │   ├── 📂 context/   # React Context API (e.g., `AuthContext.jsx` for global auth state)
│   │   ├── 📂 pages/     # Stateful Pages (Dashboard, Login, Products, Orders)
│   │   └── 📄 App.jsx    # React core application routing tree
│   ├── 📄 index.html
│   ├── 📄 package.json
│   └── 📄 vite.config.js # Vite Bundler mappings
└── 📄 README.md          # Project Documentation
```

## 🛡️ Security Measures
This app employs industry-standard mechanisms to combat vulnerabilities:
- **XSS & Injection Protection:** Validations and Pre-compiled SQL abstractions help prevent arbitrary injection requests (`express-validator`). Access patterns prevent malicious script reflection.
- **Brute-Force & Rate Limiting:** Enforced via `express-rate-limit` on critical endpoints, including Login modules.
- **Sensitive Data Obfuscation:** Passwords safely processed with strong hashing standard prior to DML commits.

## 👥 Usage Path
1. **Initial Deployment:** Complete setup. Go to `/setup` or `/register` to generate your initial Admin user if one does not exist.
2. **Access Control:** Log in. The application will conditionally present the **Admin Dashboard** natively if authenticated correctly. 
3. **Provision Staff:** Create credentials within the User Management pane to provide limited system visibility context for standard users.
