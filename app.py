from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from dotenv import load_dotenv
import os
from datetime import date, timedelta

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY")
jwt = JWTManager(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOCAL_CA = os.path.join(BASE_DIR, "isrgrootx1.pem")
SYSTEM_CA = "/etc/ssl/certs/ca-certificates.crt"
CA_PATH = LOCAL_CA if os.path.exists(LOCAL_CA) else SYSTEM_CA

db_config = {
    'host': os.environ.get('DB_HOST'),
    'port': int(os.environ.get('DB_PORT', 4000)),
    'database': os.environ.get('DB_NAME', 'VSMS_db'),
    'user': os.environ.get('DB_USER'),
    'password': os.environ.get('DB_PASSWORD'),
    'ssl_ca': CA_PATH,
    'ssl_verify_cert': True,
    'use_pure': True
}

def create_db_connection():
    connection = None
    try:
        connection = mysql.connector.connect(**db_config)
    except Error as e:
        print(f"Error connecting to TiDB Cloud: {e}")
    return connection

def get_safe_identity():
    identity_id = get_jwt_identity()
    if not identity_id:
        return None

    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT User_ID, Role FROM USERS WHERE User_ID = %s", (identity_id,))
            return cursor.fetchone()
        finally:
            connection.close()
    return None

# ==========================================
# PUBLIC SIGNUP ROUTE
# ==========================================
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get('Name')
    email = data.get('Email')
    password = data.get('Password')
    phone = data.get('Phone', '')

    if not name or not email or not password:
        return jsonify({"error": "Name, Email, and Password are required"}), 400

    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute("SELECT * FROM USERS WHERE Email = %s", (email,))
            if cursor.fetchone():
                return jsonify({"error": "Account with this email already exists"}), 400

            sql = "INSERT INTO USERS (Name, Email, Password, Phone, Role) VALUES (%s, %s, %s, %s, 'User')"
            cursor.execute(sql, (name, email, password, phone))
            connection.commit()
            return jsonify({"message": "Account created successfully!"}), 201
        except Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            cursor.close()
            connection.close()
    return jsonify({"error": "Database connection failed"}), 500


# ==========================================
# DYNAMIC NOTIFICATIONS ROUTE
# ==========================================
@app.route('/api/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    identity = get_safe_identity()
    if not identity:
        return jsonify({"error": "Unauthorized"}), 401

    role = identity.get('Role')
    user_id = identity.get('User_ID')

    connection = create_db_connection()
    if not connection:
        return jsonify({"error": "Database error"}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        notifications = []
        today = date.today()

        if role == 'Admin':
            cursor.execute("SELECT COUNT(*) as pending_count FROM SERVICE_TOKENS WHERE Status = 'Pending'")
            pending_tokens = cursor.fetchone().get('pending_count', 0)
            if pending_tokens > 0:
                notifications.append({
                    "id": "admin_pending_tokens", "title": "Action Required: Pending Requests",
                    "message": f"You have {pending_tokens} new service scheduling requests awaiting approval.",
                    "type": "warning", "time": "Just Now"
                })
        else:
            # 1. Approved Token Notifications
            cursor.execute("""
                SELECT t.Token_ID, t.Requested_Date, TIME_FORMAT(t.Assigned_Time, '%H:%i') as Assigned_Time, 
                       v.Registration_Number, t.Admin_Message 
                FROM SERVICE_TOKENS t 
                JOIN VEHICLE v ON t.Vehicle_ID = v.Vehicle_ID 
                WHERE t.User_ID = %s AND t.Status = 'Approved'
            """, (user_id,))

            for t in cursor.fetchall():
                token_str = f"TKN-{str(t['Token_ID']).zfill(4)}"
                time_str = f" at {t['Assigned_Time']}" if t['Assigned_Time'] else ""
                notifications.append({
                    "id": f"token_app_{t['Token_ID']}", "title": f"Token {token_str} Approved!",
                    "message": f"Bring in {t['Registration_Number']} on {t['Requested_Date']}{time_str}. {t['Admin_Message'] or ''}",
                    "type": "success", "time": str(t['Requested_Date'])
                })

            # 2. Smart Timely Service Alerts
            cursor.execute("""
                SELECT v.Vehicle_ID, v.Registration_Number, v.Brand, 
                       MAX(s.Service_Date) as Last_Service, v.Purchase_Date
                FROM VEHICLE v
                LEFT JOIN SERVICE_RECORD s ON v.Vehicle_ID = s.Vehicle_ID
                WHERE v.User_ID = %s
                GROUP BY v.Vehicle_ID, v.Registration_Number, v.Brand, v.Purchase_Date
            """, (user_id,))

            for v in cursor.fetchall():
                base_date = v['Last_Service'] if v['Last_Service'] else v['Purchase_Date']
                if base_date:
                    next_service_date = base_date + timedelta(days=180)
                    days_until = (next_service_date - today).days

                    if 0 < days_until <= 7:
                        notifications.append({
                            "id": f"rem_soon_{v['Vehicle_ID']}", "title": "Timely Service Approaching!",
                            "message": f"Your timely service for {v['Brand']} ({v['Registration_Number']}) is in this week! It is in {days_until} days.",
                            "type": "info", "time": "Action Required"
                        })
                    elif days_until == 0:
                        notifications.append({
                            "id": f"rem_today_{v['Vehicle_ID']}", "title": "Service Due Today!",
                            "message": f"Your timely service for {v['Brand']} ({v['Registration_Number']}) is due TODAY! Please request a slot.",
                            "type": "warning", "time": "Action Required"
                        })
                    elif days_until < 0 and days_until >= -45:
                        notifications.append({
                            "id": f"rem_missed_{v['Vehicle_ID']}", "title": "Service Missed!",
                            "message": f"You have missed your timely service for {v['Brand']} ({v['Registration_Number']}) by {abs(days_until)} days. Please contact us or schedule a slot to prevent damage.",
                            "type": "warning", "time": "Overdue"
                        })

        return jsonify(notifications), 200
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('Email')
    password = data.get('Password')

    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM USERS WHERE Email = %s AND Password = %s", (email, password))
            user = cursor.fetchone()

            if user:
                user.pop('Password', None)
                access_token = create_access_token(identity=str(user['User_ID']))
                return jsonify({"message": "Login successful!", "token": access_token, "user": user}), 200
            else:
                return jsonify({"error": "Invalid email or password"}), 401
        except Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            cursor.close()
            connection.close()
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/users', methods=['GET', 'POST', 'PUT', 'DELETE'])
@jwt_required()
def handle_users():
    current_user = get_safe_identity()
    if not current_user or current_user.get('Role') != 'Admin':
        return jsonify({"error": "Unauthorized"}), 403

    connection = create_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = connection.cursor(dictionary=True)

        if request.method == 'GET':
            cursor.execute("SELECT User_ID, Name, Email, Phone, Role FROM USERS")
            users = cursor.fetchall()
            return jsonify(users), 200

        elif request.method == 'POST':
            data = request.json
            if data.get('User_ID'):
                sql = "INSERT INTO USERS (User_ID, Name, Email, Password, Phone, Role) VALUES (%s, %s, %s, %s, %s, %s)"
                values = (data.get('User_ID'), data.get('Name'), data.get('Email'), data.get('Password'), data.get('Phone'), data.get('Role', 'User'))
            else:
                sql = "INSERT INTO USERS (Name, Email, Password, Phone, Role) VALUES (%s, %s, %s, %s, %s)"
                values = (data.get('Name'), data.get('Email'), data.get('Password'), data.get('Phone'), data.get('Role', 'User'))
            cursor.execute(sql, values)
            connection.commit()
            return jsonify({"message": "User registered successfully!"}), 201

        elif request.method == 'PUT':
            data = request.json
            user_id = data.get('User_ID')
            if data.get('Password'):
                sql = "UPDATE USERS SET Name=%s, Email=%s, Phone=%s, Role=%s, Password=%s WHERE User_ID=%s"
                values = (data.get('Name'), data.get('Email'), data.get('Phone'), data.get('Role'), data.get('Password'), user_id)
            else:
                sql = "UPDATE USERS SET Name=%s, Email=%s, Phone=%s, Role=%s WHERE User_ID=%s"
                values = (data.get('Name'), data.get('Email'), data.get('Phone'), data.get('Role'), user_id)
            cursor.execute(sql, values)
            connection.commit()
            return jsonify({"message": "User updated successfully!"}), 200

        elif request.method == 'DELETE':
            data = request.json
            user_id_to_delete = data.get('User_ID')

            cursor.execute("SELECT Vehicle_ID FROM VEHICLE WHERE User_ID = %s", (user_id_to_delete,))
            user_vehicles = cursor.fetchall()

            for v in user_vehicles:
                v_id = v['Vehicle_ID']
                cursor.execute("SELECT Service_ID FROM SERVICE_RECORD WHERE Vehicle_ID = %s", (v_id,))
                vehicle_services = cursor.fetchall()

                for s in vehicle_services:
                    s_id = s['Service_ID']
                    cursor.execute("DELETE FROM PARTS_REPLACED WHERE Service_ID = %s", (s_id,))
                    cursor.execute("DELETE FROM SERVICE_RECORD WHERE Service_ID = %s", (s_id,))

                cursor.execute("DELETE FROM VEHICLE WHERE Vehicle_ID = %s", (v_id,))

            cursor.execute("DELETE FROM USERS WHERE User_ID = %s", (user_id_to_delete,))

            connection.commit()
            return jsonify({"message": "User and all associated data deleted successfully!"}), 200

    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/vehicles', methods=['GET', 'POST', 'PUT', 'DELETE'])
@jwt_required()
def handle_vehicles():
    current_user = get_safe_identity()
    connection = create_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        if request.method == 'GET':
            if current_user.get('Role') == 'Admin':
                cursor.execute("SELECT * FROM VEHICLE")
            else:
                cursor.execute("SELECT * FROM VEHICLE WHERE User_ID = %s", (current_user.get('User_ID'),))
            return jsonify(cursor.fetchall()), 200

        elif request.method == 'POST':
            data = request.json
            owner_id = data.get('User_ID') if current_user.get('Role') == 'Admin' and data.get('User_ID') else current_user.get('User_ID')

            cursor.execute("SELECT Role FROM USERS WHERE User_ID = %s", (owner_id,))
            target_user = cursor.fetchone()

            if not target_user:
                return jsonify({"error": "The specified User ID does not exist."}), 404

            if target_user['Role'] == 'Admin':
                return jsonify({"error": "Admins cannot own vehicles. Please make a regular user account for personal vehicles."}), 400

            try:
                mileage = int(data.get('Mileage', 0))
            except (ValueError, TypeError):
                mileage = 0

            sql_query = """
                INSERT INTO VEHICLE (User_ID, Registration_Number, Brand, Model, Purchase_Date, Fuel_Type, Mileage, Vehicle_Type)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            values = (
                owner_id,
                data.get('Registration_Number'),
                data.get('Brand'),
                data.get('Model'),
                data.get('Purchase_Date'),
                data.get('Fuel_Type'),
                mileage,
                data.get('Vehicle_Type', 'Car')
            )
            cursor.execute(sql_query, values)
            connection.commit()
            return jsonify({"message": "Vehicle added successfully!"}), 201

        elif request.method == 'PUT':
            if current_user.get('Role') != 'Admin':
                return jsonify({"error": "Unauthorized"}), 403
            data = request.json
            try:
                mileage = int(data.get('Mileage', 0))
            except (ValueError, TypeError):
                mileage = 0

            sql = """UPDATE VEHICLE SET Registration_Number=%s, Brand=%s, Model=%s, Fuel_Type=%s, Mileage=%s 
                     WHERE Vehicle_ID=%s"""
            val = (data.get('Registration_Number'), data.get('Brand'), data.get('Model'),
                   data.get('Fuel_Type'), mileage, data.get('Vehicle_ID'))
            cursor.execute(sql, val)
            connection.commit()
            return jsonify({"message": "Vehicle updated successfully!"}), 200

        elif request.method == 'DELETE':
            if current_user.get('Role') != 'Admin':
                return jsonify({"error": "Unauthorized"}), 403
            v_id = request.json.get('Vehicle_ID')

            cursor.execute("SELECT Service_ID FROM SERVICE_RECORD WHERE Vehicle_ID = %s", (v_id,))
            vehicle_services = cursor.fetchall()

            for s in vehicle_services:
                s_id = s['Service_ID']
                cursor.execute("DELETE FROM PARTS_REPLACED WHERE Service_ID = %s", (s_id,))
                cursor.execute("DELETE FROM SERVICE_RECORD WHERE Service_ID = %s", (s_id,))

            cursor.execute("DELETE FROM VEHICLE WHERE Vehicle_ID = %s", (v_id,))
            connection.commit()
            return jsonify({"message": "Vehicle and associated records deleted successfully!"}), 200

    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()


@app.route('/api/services', methods=['GET', 'POST', 'PUT', 'DELETE'])
@jwt_required()
def handle_services():
    current_user = get_safe_identity()
    connection = create_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)

        if request.method == 'GET':
            if current_user.get('Role') == 'Admin':
                cursor.execute("""
                    SELECT s.*, v.Brand, v.Model, v.Vehicle_Type FROM SERVICE_RECORD s
                    LEFT JOIN VEHICLE v ON s.Vehicle_ID = v.Vehicle_ID
                """)
            else:
                cursor.execute("""
                    SELECT s.*, v.Brand, v.Model, v.Vehicle_Type FROM SERVICE_RECORD s
                    JOIN VEHICLE v ON s.Vehicle_ID = v.Vehicle_ID
                    WHERE v.User_ID = %s
                """, (current_user.get('User_ID'),))
            services = cursor.fetchall()

            cursor.execute("""
                SELECT pr.Service_ID, p.Part_Name, pr.Quantity, pr.Part_Cost 
                FROM PARTS_REPLACED pr
                JOIN PARTS p ON pr.Part_ID = p.Part_ID
            """)
            all_parts = cursor.fetchall()

            for service in services:
                service['Total_Cost'] = float(service['Total_Cost'])
                service['parts'] = []
                for p in all_parts:
                    if p['Service_ID'] == service['Service_ID']:
                        p['Part_Cost'] = float(p['Part_Cost'])
                        service['parts'].append(p)

            return jsonify(services), 200

        elif request.method == 'POST':
            if current_user.get('Role') != 'Admin':
                return jsonify({"error": "Unauthorized"}), 403

            data = request.json
            try:
                v_id = int(data.get('Vehicle_ID'))
                odom = int(data.get('Odometer_Reading'))
                cost = float(data.get('Total_Cost'))
                condition = data.get('Condition_Status', 'Excellent')
            except (ValueError, TypeError):
                return jsonify({"error": "Invalid data formats."}), 400

            sql_query = """
                INSERT INTO SERVICE_RECORD (Vehicle_ID, Service_Date, Odometer_Reading, Service_Type, Service_Center, Total_Cost)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            values = (v_id, data.get('Service_Date'), odom, data.get('Service_Type'), data.get('Service_Center'), cost)
            cursor.execute(sql_query, values)

            new_service_id = cursor.lastrowid

            parts = data.get('parts', [])
            for part in parts:
                cursor.execute("""
                    INSERT INTO PARTS_REPLACED (Service_ID, Part_ID, Quantity, Part_Cost)
                    VALUES (%s, %s, %s, %s)
                """, (new_service_id, int(part['Part_ID']), int(part['Quantity']), float(part['Part_Cost'])))

            cursor.execute("""
                UPDATE VEHICLE 
                SET Condition_Status = %s 
                WHERE Vehicle_ID = %s
            """, (condition, v_id))

            connection.commit()
            return jsonify({"message": "Service logged and vehicle condition updated!"}), 201

        elif request.method == 'PUT':
            if current_user.get('Role') != 'Admin':
                return jsonify({"error": "Unauthorized"}), 403
            data = request.json
            try:
                odom = int(data.get('Odometer_Reading'))
                cost = float(data.get('Total_Cost'))
            except (ValueError, TypeError):
                return jsonify({"error": "Invalid data formats."}), 400

            sql = """UPDATE SERVICE_RECORD SET Service_Type=%s, Service_Center=%s, 
                     Odometer_Reading=%s, Total_Cost=%s WHERE Service_ID=%s"""
            val = (data.get('Service_Type'), data.get('Service_Center'),
                   odom, cost, data.get('Service_ID'))
            cursor.execute(sql, val)
            connection.commit()
            return jsonify({"message": "Service updated successfully!"}), 200

        elif request.method == 'DELETE':
            if current_user.get('Role') != 'Admin':
                return jsonify({"error": "Unauthorized"}), 403
            s_id = request.json.get('Service_ID')

            cursor.execute("DELETE FROM PARTS_REPLACED WHERE Service_ID = %s", (s_id,))
            cursor.execute("DELETE FROM SERVICE_RECORD WHERE Service_ID = %s", (s_id,))
            connection.commit()

            return jsonify({"message": "Service and associated parts deleted successfully!"}), 200

    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

# ==========================================
# SERVICE TOKEN SYSTEM ROUTE
# ==========================================
@app.route('/api/tokens', methods=['GET', 'POST', 'PUT'])
@jwt_required()
def handle_tokens():
    current_user = get_safe_identity()
    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401

    connection = create_db_connection()
    if not connection:
        return jsonify({"error": "Database error"}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        role = current_user.get('Role')
        user_id = current_user.get('User_ID')

        if request.method == 'GET':
            if role == 'Admin':
                cursor.execute("""
                    SELECT t.Token_ID, t.Requested_Date, t.Status, t.Admin_Message, t.Service_Type, t.User_Notes, 
                           t.Service_Centre, TIME_FORMAT(t.Assigned_Time, '%H:%i') as Assigned_Time,
                           u.Name as Owner_Name, u.Phone as Owner_Phone, v.Registration_Number, v.Brand 
                    FROM SERVICE_TOKENS t
                    JOIN USERS u ON t.User_ID = u.User_ID
                    JOIN VEHICLE v ON t.Vehicle_ID = v.Vehicle_ID
                    ORDER BY CASE WHEN t.Status = 'Pending' THEN 1 ELSE 2 END, t.Requested_Date ASC
                """)
            else:
                cursor.execute("""
                    SELECT t.Token_ID, t.Requested_Date, t.Status, t.Admin_Message, t.Service_Type, t.User_Notes,
                           t.Service_Centre, TIME_FORMAT(t.Assigned_Time, '%H:%i') as Assigned_Time,
                           v.Registration_Number, v.Brand 
                    FROM SERVICE_TOKENS t
                    JOIN VEHICLE v ON t.Vehicle_ID = v.Vehicle_ID
                    WHERE t.User_ID = %s
                    ORDER BY t.Requested_Date DESC
                """, (user_id,))
            return jsonify(cursor.fetchall()), 200

        elif request.method == 'POST':
            data = request.json
            cursor.execute("SELECT * FROM SERVICE_TOKENS WHERE Vehicle_ID = %s AND Status = 'Pending'", (data.get('Vehicle_ID'),))
            if cursor.fetchone():
                return jsonify({"error": "This vehicle already has a pending service request."}), 400

            sql = """INSERT INTO SERVICE_TOKENS (User_ID, Vehicle_ID, Requested_Date, Service_Type, User_Notes, Service_Centre) 
                     VALUES (%s, %s, %s, %s, %s, %s)"""
            cursor.execute(sql, (
                user_id,
                data.get('Vehicle_ID'),
                data.get('Requested_Date'),
                data.get('Service_Type', 'Maintenance'),
                data.get('User_Notes', ''),
                data.get('Service_Centre', 'Udupi')
            ))
            connection.commit()
            return jsonify({"message": "Service token requested successfully!"}), 201

        elif request.method == 'PUT':
            if role != 'Admin':
                return jsonify({"error": "Unauthorized"}), 403
            data = request.json

            if data.get('Status') == 'Approved' and not data.get('Assigned_Time'):
                return jsonify({"error": "An assigned time is required to approve a token."}), 400

            sql = "UPDATE SERVICE_TOKENS SET Status = %s, Admin_Message = %s, Assigned_Time = %s WHERE Token_ID = %s"
            cursor.execute(sql, (data.get('Status'), data.get('Admin_Message', ''), data.get('Assigned_Time'), data.get('Token_ID')))
            connection.commit()
            return jsonify({"message": f"Token marked as {data.get('Status')}!"}), 200

    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/analytics', methods=['GET'])
@jwt_required()
def get_analytics():
    identity = get_safe_identity()
    if not identity:
        return jsonify({"error": "Invalid token"}), 401

    user_id = identity.get('User_ID')
    role = identity.get('Role')

    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            if role == 'Admin':
                cursor.execute("SELECT COUNT(*) as total_users FROM USERS")
                users_count = cursor.fetchone()['total_users']

                cursor.execute("SELECT COUNT(*) as total_vehicles FROM VEHICLE")
                vehicles_count = cursor.fetchone()['total_vehicles']

                cursor.execute("SELECT SUM(Total_Cost) as gross_revenue FROM SERVICE_RECORD")
                gross_revenue = float(cursor.fetchone()['gross_revenue'] or 0)
                admin_cut = gross_revenue * 0.10

                cursor.execute("""
                    SELECT COUNT(*) as monthly_services 
                    FROM SERVICE_RECORD 
                    WHERE MONTH(Service_Date) = MONTH(CURRENT_DATE()) 
                    AND YEAR(Service_Date) = YEAR(CURRENT_DATE())
                """)
                monthly_services = cursor.fetchone()['monthly_services'] or 0

                cursor.execute("""
                    SELECT p.Part_Name as name, p.Standard_Life_KM as reliability, COUNT(pr.Part_ID) as replacements
                    FROM PARTS_REPLACED pr
                    JOIN PARTS p ON pr.Part_ID = p.Part_ID
                    GROUP BY p.Part_ID, p.Part_Name, p.Standard_Life_KM
                    ORDER BY replacements DESC LIMIT 5
                """)
                parts_data = cursor.fetchall()

                return jsonify({
                    "total_users": users_count,
                    "total_vehicles": vehicles_count,
                    "total_revenue": admin_cut,
                    "monthly_services": monthly_services,
                    "partReliabilityData": parts_data
                }), 200
            else:
                cursor.execute("SELECT COUNT(*) as total_vehicles FROM VEHICLE WHERE User_ID = %s", (user_id,))
                vehicles_count = cursor.fetchone()['total_vehicles']

                cursor.execute("""
                    SELECT SUM(s.Total_Cost) as total_revenue FROM SERVICE_RECORD s
                    JOIN VEHICLE v ON s.Vehicle_ID = v.Vehicle_ID WHERE v.User_ID = %s
                """, (user_id,))
                revenue = float(cursor.fetchone()['total_revenue'] or 0)

                cursor.execute("""
                    SELECT COUNT(pr.Part_ID) as parts_count, SUM(pr.Part_Cost * pr.Quantity) as parts_cost
                    FROM PARTS_REPLACED pr
                    JOIN SERVICE_RECORD s ON pr.Service_ID = s.Service_ID
                    JOIN VEHICLE v ON s.Vehicle_ID = v.Vehicle_ID
                    WHERE v.User_ID = %s
                """, (user_id,))

                parts_stat = cursor.fetchone() or {}
                parts_count = parts_stat.get('parts_count') or 0
                parts_cost = float(parts_stat.get('parts_cost') or 0)

                cursor.execute("""
                    SELECT v.Vehicle_ID, MONTHNAME(s.Service_Date) as month_name, 
                           MONTH(s.Service_Date) as m, YEAR(s.Service_Date) as y, 
                           COUNT(*) as service_count, SUM(s.Total_Cost) as cost
                    FROM SERVICE_RECORD s
                    JOIN VEHICLE v ON s.Vehicle_ID = v.Vehicle_ID
                    WHERE v.User_ID = %s
                    GROUP BY v.Vehicle_ID, YEAR(s.Service_Date), MONTH(s.Service_Date), MONTHNAME(s.Service_Date)
                    ORDER BY YEAR(s.Service_Date) ASC, MONTH(s.Service_Date) ASC
                """, (user_id,))

                monthly_data = cursor.fetchall()
                for row in monthly_data:
                    row['cost'] = float(row['cost'] or 0)
                    row['display_label'] = f"{row['month_name'][:3]} {row['y']}"

                cursor.execute("""
                    SELECT p.Part_Name as name, SUM(pr.Part_Cost * pr.Quantity) as total_spent
                    FROM PARTS_REPLACED pr
                    JOIN SERVICE_RECORD s ON pr.Service_ID = s.Service_ID
                    JOIN PARTS p ON pr.Part_ID = p.Part_ID
                    JOIN VEHICLE v ON s.Vehicle_ID = v.Vehicle_ID
                    WHERE v.User_ID = %s
                    GROUP BY p.Part_ID, p.Part_Name
                    ORDER BY total_spent DESC LIMIT 5
                """, (user_id,))

                cost_leaks = cursor.fetchall()
                for c in cost_leaks:
                    c['total_spent'] = float(c['total_spent'] or 0)

                cursor.execute("""
                    SELECT v.Vehicle_ID, v.Registration_Number, v.Brand, v.Model, 
                           SUM(s.Total_Cost) as total_spent, COUNT(s.Service_ID) as service_count
                    FROM VEHICLE v
                    LEFT JOIN SERVICE_RECORD s ON v.Vehicle_ID = s.Vehicle_ID
                    WHERE v.User_ID = %s
                    GROUP BY v.Vehicle_ID, v.Registration_Number, v.Brand, v.Model
                """, (user_id,))

                vehicle_breakdown = cursor.fetchall()
                for vb in vehicle_breakdown:
                    vb['total_spent'] = float(vb['total_spent'] or 0)

                return jsonify({
                    "total_vehicles": vehicles_count,
                    "total_revenue": revenue,
                    "parts_count": parts_count,
                    "parts_cost": parts_cost,
                    "monthly_data": monthly_data,
                    "cost_leaks": cost_leaks,
                    "vehicle_breakdown": vehicle_breakdown
                }), 200

        except Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            cursor.close()
            connection.close()
    return jsonify({"error": "Database connection failed"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)