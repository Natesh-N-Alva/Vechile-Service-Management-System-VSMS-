# Vehicle Service Management System (VSMS)

A full-stack web application designed to streamline vehicle maintenance tracking, service slot scheduling, parts inventory logging, and expenditure analytics for vehicle owners and service center administrators. Built with a **Next.js** frontend, a **Flask** REST API backend, and a cloud-hosted **TiDB (MySQL-compatible)** relational database.

---

## Key Features

### Role-Based Authentication & Security
* **JWT Authentication:** Stateless session management via `Flask-JWT-Extended` separating **User** and **Admin** privileges.
* **Role Enforcement:** Admins manage fleet-wide records, approve tokens, and log completed services, while regular users manage their personal garage, request service appointments, and track maintenance costs.

### Garage & Vehicle Management
* **Fleet Registry:** Register vehicles with details including registration number, brand, model, purchase date, fuel type, vehicle type, odometer mileage, and real-time condition status (`Excellent`, etc.).
* **Relational Integrity:** Cascading cleanup handlers ensure safe removal of vehicles, linked service records, and replaced part logs.

### Service Token Scheduling System
* **Appointment Booking:** Vehicle owners can request maintenance slots by selecting a vehicle, preferred date, service type, preferred service center (e.g., Udupi), and custom notes.
* **Duplicate Prevention:** Automatically prevents submitting overlapping `Pending` requests for the same vehicle.
* **Admin Queue & Slot Assignment:** Admins review pending requests, assign specific appointment times (`HH:MM`), attach status messages, and update token states (`Pending`, `Approved`, `Rejected`, `Completed`).

### Service Logging & Parts Replacement Tracking
* **Detailed Service Records:** Admins log completed services with odometer readings, service center details, total cost, and updated vehicle condition status.
* **Itemized Parts Mapping:** Links specific catalog parts (`PARTS`) to service events (`PARTS_REPLACED`) with quantities and unit costs.

### Smart Notifications & Analytics
* **Automated Service Reminders:** Calculates 180-day maintenance cycles from the vehicle's last service date (or purchase date) to trigger timely alerts:
  * **Approaching:** Within 7 days of due date.
  * **Due Today:** Exact 180-day mark.
  * **Overdue:** Up to 45 days past due date.
* **Token Approval Alerts:** Notifies users immediately with formatted token IDs (`TKN-XXXX`), assigned times, and admin instructions.
* **Interactive Analytics:**
  * **User View:** Total maintenance spend, parts expenditure, chronological monthly spending trends, top 5 cost-leak parts, and per-vehicle cost breakdowns.
  * **Admin View:** Total registered users, total fleet size, monthly service volume, platform revenue metrics, and top 5 most-replaced parts against standard lifespan benchmarks.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router / Turbopack), React, TypeScript/JavaScript, CSS / Tailwind CSS |
| **Backend** | Python 3, Flask, Flask-CORS, Flask-JWT-Extended, `mysql-connector-python`, `python-dotenv` |
| **Database** | TiDB Cloud Serverless (MySQL 8.0 Wire-Compatible) with TLS/SSL Encryption |

---

## How the Database Works (TiDB Cloud Architecture)

Instead of requiring every developer to install and configure a local MySQL/MariaDB server, VSMS uses a centralized **TiDB Cloud Serverless** cluster (`VSMS_db`) over the public internet:

* **MySQL 8.0 Wire-Compatibility:** TiDB speaks the standard MySQL protocol, allowing Flask to communicate using `mysql-connector-python` (`use_pure=True`) with standard relational SQL queries, joins, transactions, and foreign keys.
* **Mandatory TLS/SSL Encryption:** Public connections to TiDB Cloud run over port **`4000`** with strict TLS certificate verification (`ssl_verify_cert=True`). The repository includes `isrgrootx1.pem` so Windows, macOS, and Linux machines can verify the server certificate out of the box (with automatic fallback to `/etc/ssl/certs/ca-certificates.crt` on Linux).
* **Zero-Config Credential Loading:** `app.py` uses `python-dotenv` to read `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` from a local `.env` file at runtime, keeping secrets completely out of source control.
* **Shared vs. Individual Clusters:**
  * *Connecting to the team cluster:* Ensure your current public IP address is whitelisted under **Cluster Settings > Network / IP Access List** in TiDB Cloud (or set to `0.0.0.0/0` during active development).
  * *Running your own isolated instance:* Spin up a free **TiDB Cloud Starter** cluster, execute the schema SQL below in the TiDB SQL Editor, and paste your new credentials into `.env`.

### Relational Schema (6 Normalized Tables)
1. **`USERS`** — Stores user profiles, contact details, roles (`Admin` / `User`), and credentials.
2. **`VEHICLE`** — Tracks registered vehicles linked to `USERS` (`User_ID`).
3. **`SERVICE_RECORD`** — Logs completed maintenance visits, odometer readings, and total costs linked to `VEHICLE`.
4. **`PARTS`** — Master catalog of vehicle components, categories, and expected lifespan (`Standard_Life_KM`).
5. **`PARTS_REPLACED`** — Junction table mapping replaced parts, quantities, and costs to specific `SERVICE_RECORD` entries.
6. **`SERVICE_TOKENS`** — Manages appointment requests, scheduling statuses, assigned times, and service center locations.

---

## How to Run the Project Locally

### Prerequisites
* **Python 3.10+** and `pip`
* **Node.js 18+** and `npm`
* **Git**

### Step 1: Clone the Repository
```bash
git clone [https://github.com/Natesh-N-Alva/](https://github.com/Natesh-N-Alva/)<your-repo-name>.git
cd vehicle_system
```

### Step 2: Set Up Environment Variables
Copy `.env.example` to create your local `.env` file and fill in your TiDB Cloud credentials (ask the repo maintainer for the shared cluster `.env` values, or use your own TiDB cluster credentials):
```bash
cp .env.example .env
```
```env
JWT_SECRET_KEY=your-super-secret-jwt-key
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_NAME=VSMS_db
DB_USER=your-cluster-prefix.root
DB_PASSWORD=your-cluster-password
```

### Step 3: Set Up & Run the Flask Backend
1. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate        # Linux / macOS
   # venv\Scripts\activate         # Windows (Command Prompt / PowerShell)
   ```
2. Install all required Python dependencies from `requirements.txt`:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the Flask API server:
   ```bash
   python app.py
   ```
   The backend will start at **`http://127.0.0.1:5000`**.

### Step 4: Set Up & Run the Next.js Frontend
Open a **second terminal** in the project root, navigate to `static/`, install Node dependencies, and start the dev server:
```bash
cd static
npm install
npm run dev
```
The frontend will launch at **`http://localhost:3000`**.

### Step 5: Log In & Test
* Open **`http://localhost:3000/login`** in your browser.
* Create a new user account via **`/signup`**, or sign in with your seeded Admin credentials to manage tokens, vehicles, and service logs.

---

## Database Schema Initialization (For Fresh Clusters)

If you are setting up a brand-new TiDB Cloud or MySQL 8.0+ database from scratch, run this script in the **SQL Editor**:

```sql
CREATE DATABASE IF NOT EXISTS VSMS_db;
USE VSMS_db;

CREATE TABLE USERS (
    User_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(50),
    Email VARCHAR(50) UNIQUE,
    Phone VARCHAR(15),
    Role VARCHAR(10),
    Password VARCHAR(255)
);

CREATE TABLE VEHICLE (
    Vehicle_ID INT AUTO_INCREMENT PRIMARY KEY,
    User_ID INT,
    Registration_Number VARCHAR(20) UNIQUE,
    Brand VARCHAR(30),
    Model VARCHAR(30),
    Purchase_Date DATE,
    Fuel_Type VARCHAR(10),
    Condition_Status VARCHAR(20) DEFAULT 'Excellent',
    Mileage INT DEFAULT 0,
    Vehicle_Type VARCHAR(50) DEFAULT 'Car',
    FOREIGN KEY (User_ID) REFERENCES USERS(User_ID)
);

CREATE TABLE SERVICE_RECORD (
    Service_ID INT AUTO_INCREMENT PRIMARY KEY,
    Vehicle_ID INT,
    Service_Date DATE,
    Odometer_Reading INT,
    Service_Type VARCHAR(30),
    Service_Center VARCHAR(50),
    Total_Cost DECIMAL(10,2),
    FOREIGN KEY (Vehicle_ID) REFERENCES VEHICLE(Vehicle_ID)
);

CREATE TABLE PARTS (
    Part_ID INT AUTO_INCREMENT PRIMARY KEY,
    part_cost INT,
    Part_Name VARCHAR(50),
    Category VARCHAR(30),
    Standard_Life_KM INT
);

CREATE TABLE PARTS_REPLACED (
    Replacement_ID INT AUTO_INCREMENT PRIMARY KEY,
    Service_ID INT,
    Part_ID INT,
    Quantity INT,
    Part_Cost DECIMAL(10,2),
    FOREIGN KEY (Service_ID) REFERENCES SERVICE_RECORD(Service_ID),
    FOREIGN KEY (Part_ID) REFERENCES PARTS(Part_ID)
);

CREATE TABLE SERVICE_TOKENS (
    Token_ID INT AUTO_INCREMENT PRIMARY KEY,
    User_ID INT NOT NULL,
    Vehicle_ID INT NOT NULL,
    Requested_Date DATE NOT NULL,
    Status ENUM('Pending', 'Approved', 'Rejected', 'Completed') DEFAULT 'Pending',
    Admin_Message VARCHAR(255) DEFAULT NULL,
    Service_Type VARCHAR(50) DEFAULT 'Maintenance',
    User_Notes TEXT DEFAULT NULL,
    Assigned_Time TIME DEFAULT NULL,
    Service_Centre VARCHAR(50) DEFAULT 'Udupi',
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (User_ID) REFERENCES USERS(User_ID) ON DELETE CASCADE,
    FOREIGN KEY (Vehicle_ID) REFERENCES VEHICLE(Vehicle_ID) ON DELETE CASCADE
);

-- Seed initial parts catalog
INSERT INTO PARTS (Part_Name, Category, Standard_Life_KM) VALUES
('Oil Filter', 'Filter', 7000),
('Air Filter', 'Filter', 10000),
('Fuel Filter', 'Filter', 15000),
('Clutch Plate', 'Transmission', 60000),
('Spark Plug', 'Ignition', 20000),
('Battery', 'Electrical', 40000),
('Coolant', 'Fluid', 20000),
('Timing Belt', 'Engine', 70000),
('Headlight Bulb', 'Electrical', 25000),
('Engine Oil (Synthetic)', 'Fluid', 10000),
('Brake Pads (Front)', 'Brakes', 40000),
('Spark Plugs (Set of 4)', 'Engine', 60000),
('12V Car Battery', 'Electrical', 50000),
('Wiper Blades', 'Accessories', 10000),
('Brake Fluid', 'Fluid', 10000);
```

---

## API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/signup` | Public | Register a new `User` account |
| `POST` | `/api/login` | Public | Authenticate user and return JWT access token |
| `GET` | `/api/notifications` | JWT | Fetch role-specific token alerts and 180-day service reminders |
| `GET, POST, PUT, DELETE` | `/api/users` | Admin | Manage user accounts with cascading data cleanup |
| `GET, POST, PUT, DELETE` | `/api/vehicles` | JWT / Admin | View own/all vehicles, add new vehicles, or update/delete records |
| `GET, POST, PUT, DELETE` | `/api/services` | JWT / Admin | Retrieve service histories with itemized parts or log new services |
| `GET, POST, PUT` | `/api/tokens` | JWT / Admin | Request service appointments or approve/reject tokens with time slots |
| `GET` | `/api/analytics` | JWT | Fetch role-tailored financial, fleet, and part reliability metrics |

---

## Project Structure

```text
vehicle_system/
├── app.py                  # Flask REST API and TiDB Cloud connection logic
├── requirements.txt        # Python backend dependencies
├── isrgrootx1.pem          # TLS root certificate for TiDB Cloud verification
├── .env.example            # Environment variable template
├── .gitignore              # Git ignore rules for secrets, venv, and build files
├── static/                 # Next.js frontend application
│   ├── src/ / app/         # Frontend pages, components, and dashboard views
│   ├── package.json        # Node dependencies and scripts
│   └── next.config.*       # Next.js configuration
└── templates/              # Additional template assets
```

---

## Roadmap
* **Predictive Part-Wear Engine:** Compute real-time remaining component lifespan (`Standard_Life_KM` vs. odometer delta since last replacement) and surface wear progress bars on vehicle dashboards.
* **Password Hashing:** Upgrade authentication from plaintext storage to `werkzeug.security` (`generate_password_hash` / `check_password_hash`).
* **Automated Invoices:** Generate downloadable PDF service receipts upon token completion.