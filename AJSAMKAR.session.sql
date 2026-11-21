CREATE DATABASE VSMS_db;
USE VSMS_db;

CREATE TABLE USERS (
    User_ID INT PRIMARY KEY,
    Name VARCHAR(50),
    Email VARCHAR(50),
    Phone VARCHAR(15),
    Role VARCHAR(10),
    Password VARCHAR(255)
);

CREATE TABLE VEHICLE (
    Vehicle_ID INT PRIMARY KEY,
    User_ID INT,
    Registration_Number VARCHAR(20),
    Brand VARCHAR(30),
    Model VARCHAR(30),
    Purchase_Date DATE,
    Fuel_Type VARCHAR(10),
    FOREIGN KEY (User_ID) REFERENCES USERS(User_ID)
);

CREATE TABLE SERVICE_RECORD (
    Service_ID INT PRIMARY KEY,
    Vehicle_ID INT,
    Service_Date DATE,
    Odometer_Reading INT,
    Service_Type VARCHAR(30),
    Service_Center VARCHAR(50),
    Total_Cost DECIMAL(10,2),
    FOREIGN KEY (Vehicle_ID) REFERENCES VEHICLE(Vehicle_ID)
);

CREATE TABLE PARTS (
    Part_ID INT PRIMARY KEY,
    part_cost  int,
    Part_Name VARCHAR(50),
    Category VARCHAR(30),
    Standard_Life_KM INT
);

CREATE TABLE PARTS_REPLACED (
    Replacement_ID INT PRIMARY KEY,
    Service_ID INT,
    Part_ID INT,
    Quantity INT,
    Part_Cost DECIMAL(10,2),
    FOREIGN KEY (Service_ID) REFERENCES SERVICE_RECORD(Service_ID),
    FOREIGN KEY (Part_ID) REFERENCES PARTS(Part_ID)
);

ALTER TABLE USERS ADD CONSTRAINT UNIQUE (Email);
ALTER TABLE VEHICLE ADD CONSTRAINT UNIQUE (Registration_Number);

ALTER TABLE VEHICLE ADD COLUMN Condition_Status VARCHAR(20) DEFAULT 'Excellent';

ALTER TABLE USERS MODIFY User_ID INT AUTO_INCREMENT;
ALTER TABLE VEHICLE MODIFY Vehicle_ID INT AUTO_INCREMENT;
ALTER TABLE SERVICE_RECORD MODIFY Service_ID INT AUTO_INCREMENT;
ALTER TABLE PARTS MODIFY Part_ID INT AUTO_INCREMENT;
ALTER TABLE PARTS_REPLACED MODIFY Replacement_ID INT AUTO_INCREMENT;

INSERT INTO USERS 
VALUES (2, 'Nate', 'nateshnalva@gmail.com', '9274944039', 'Admin', 'NATE123');



insertion values for parts 
INSERT INTO PARTS (Part_Name, Category, Standard_Life_KM) VALUES
('Oil Filter', 'Filter', 7000),
('Air Filter', 'Filter', 10000),
('Fuel Filter', 'Filter', 15000),
('Clutch Plate', 'Transmission', 60000),
('Spark Plug', 'Ignition', 20000),
('Battery', 'Electrical', 40000),
('Coolant', 'Fluid', 20000),
('Timing Belt', 'Engine', 70000),
('Headlight Bulb', 'Electrical', 25000);


INSERT INTO PARTS (Part_Name, Category, Standard_Life_KM) VALUES 
('Engine Oil (Synthetic)', 'Fluid', 10000),
('Brake Pads (Front)', 'Brakes', 40000),
('Air Filter', 'Filter', 15000),
('Spark Plugs (Set of 4)', 'Engine', 60000),
('12V Car Battery', 'Electrical', 50000),
('Wiper Blades', 'Accessories', 10000);

ALTER TABLE VEHICLE ADD COLUMN Mileage INT DEFAULT 0;

ALTER TABLE VEHICLE ADD COLUMN Vehicle_Type VARCHAR(50) DEFAULT 'Car';

Alter table PARTS Add Column Part_

INSERT INTO PARTS (Part_Name, Category, Standard_Life_KM) VALUES 
('Brake Fluid', 'Fluid', 10000);

SELECT * FROM USERS;
SELECT * FROM VEHICLE;
SELECT * FROM SERVICE_RECORD;
SELECT * FROM PARTS;
SELECT * FROM PARTS_REPLACED;

CREATE TABLE SERVICE_TOKENS (
    Token_ID INT AUTO_INCREMENT PRIMARY KEY,
    User_ID INT NOT NULL,
    Vehicle_ID INT NOT NULL,
    Requested_Date DATE NOT NULL,
    Status ENUM('Pending', 'Approved', 'Rejected', 'Completed') DEFAULT 'Pending',
    Admin_Message VARCHAR(255) DEFAULT NULL,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (User_ID) REFERENCES USERS(User_ID) ON DELETE CASCADE,
    FOREIGN KEY (Vehicle_ID) REFERENCES VEHICLE(Vehicle_ID) ON DELETE CASCADE
);

ALTER TABLE SERVICE_TOKENS 
ADD COLUMN Service_Type VARCHAR(50) DEFAULT 'Maintenance',
ADD COLUMN User_Notes TEXT DEFAULT NULL;
ALTER TABLE SERVICE_TOKENS 
ADD COLUMN Assigned_Time TIME DEFAULT NULL;
