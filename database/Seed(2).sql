USE university_db;
-- SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

-- Clear all tables first to avoid duplicates
DELETE FROM salary_component;
DELETE FROM salary_payment;
DELETE FROM payment_status;
DELETE FROM leave_request;
DELETE FROM leave_status;
DELETE FROM leave_type;
DELETE FROM maintenance_request;
DELETE FROM maintenance_status;
DELETE FROM waste_collection;
DELETE FROM work_schedule;
DELETE FROM worker;
DELETE FROM employment_status;
DELETE FROM worker_type;
DELETE FROM inventory_stock;
DELETE FROM supplier;
DELETE FROM item;
DELETE FROM dustbin;
DELETE FROM dustbin_status;
DELETE FROM bin_type;
DELETE FROM building;
DELETE FROM building_type;
DELETE FROM campus_contact;
DELETE FROM campus;
DELETE FROM university_contact;
DELETE FROM university;
DELETE FROM users;

-- Reset auto increment
ALTER TABLE salary_component AUTO_INCREMENT = 1;
ALTER TABLE salary_payment AUTO_INCREMENT = 1;
ALTER TABLE leave_request AUTO_INCREMENT = 1;
ALTER TABLE maintenance_request AUTO_INCREMENT = 1;
ALTER TABLE waste_collection AUTO_INCREMENT = 1;
ALTER TABLE work_schedule AUTO_INCREMENT = 1;
ALTER TABLE worker AUTO_INCREMENT = 1;
ALTER TABLE inventory_stock AUTO_INCREMENT = 1;
ALTER TABLE dustbin AUTO_INCREMENT = 1;
ALTER TABLE building AUTO_INCREMENT = 1;
ALTER TABLE campus AUTO_INCREMENT = 1;
ALTER TABLE university AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;

-- UNIVERSITIES
INSERT INTO university (name, main_campus_location) VALUES
('National University of Environmental Sciences', 'Lahore'),
('Global Institute of Technology', 'Islamabad');

-- UNIVERSITY CONTACTS
INSERT INTO university_contact (university_id, contact_type, contact_value) VALUES
(1, 'Email', 'info@nues.edu.pk'),
(1, 'Phone', '042-1111111'),
(2, 'Email', 'contact@git.edu.pk'),
(2, 'Phone', '051-2222222');

-- CAMPUSES
INSERT INTO campus (university_id, campus_name, address) VALUES
(1, 'NUES Lahore Campus', 'Johar Town, Lahore'),
(1, 'NUES Islamabad Campus', 'H-12, Islamabad'),
(2, 'GIT Islamabad Campus', 'Sector F-11, Islamabad'),
(2, 'GIT Karachi Campus', 'Clifton, Karachi');

-- CAMPUS CONTACTS
INSERT INTO campus_contact (campus_id, contact_type, contact_value) VALUES
(1, 'Phone', '042-1111001'),
(1, 'Email', 'lahore@nues.edu.pk'),
(2, 'Phone', '051-2222001'),
(2, 'Email', 'isb@nues.edu.pk'),
(3, 'Phone', '051-3333001'),
(3, 'Email', 'isb@git.edu.pk'),
(4, 'Phone', '021-4444001'),
(4, 'Email', 'karachi@git.edu.pk');

-- BUILDING TYPES
INSERT INTO building_type (name) VALUES
('Academic'),('Administrative'),('Residential'),('Library'),('Laboratory');

-- BUILDINGS
INSERT INTO building (campus_id, building_name, building_type_id) VALUES
(1,'Academic Block A',1),
(1,'Admin Block',2),
(1,'Hostel A',3),
(1,'Library Main',4),
(2,'Academic Block North',1),
(2,'Admin Block ISB',2),
(2,'Hostel B',3),
(2,'Science Lab',5),
(3,'Academic Block GIT',1),
(3,'Library GIT',4),
(3,'Hostel Karachi',3),
(4,'Admin Karachi',2),
(4,'Lab Complex',5);

-- BIN TYPES
INSERT INTO bin_type (name) VALUES
('General'),('Recyclable'),('Chemical'),('Organic');

-- DUSTBIN STATUS
INSERT INTO dustbin_status (status_name) VALUES
('Empty'),('Full'),('InUse'),('Maintenance');

-- DUSTBINS
INSERT INTO dustbin (building_id, bin_type_id, capacity, current_fill_level, dustbin_status_id) VALUES
(1,1,120,60,3),(1,2,100,40,3),(1,3,80,20,1),
(2,1,150,70,3),(2,2,100,50,3),
(3,1,200,90,2),(3,2,100,30,1),
(4,2,100,10,1),
(5,1,120,60,3),(5,3,80,20,1),
(6,1,150,75,2),(6,4,100,40,1),
(7,1,180,60,3),(7,2,100,25,1),
(8,3,120,10,1),(8,4,100,5,1),
(9,1,200,80,3),(9,2,100,50,2),
(10,1,150,70,3),(10,3,80,20,1),
(11,2,120,40,1),(11,4,100,5,1),
(12,1,200,90,2),(12,2,100,50,3),
(13,1,150,70,3),(13,3,80,20,1),
(14,2,120,40,1),(14,4,100,5,1);

-- ITEMS
INSERT INTO item (item_name, item_category) VALUES
('Cleaning Gloves','Safety'),('Garbage Bags','Consumable'),('Mop','Equipment'),
('Disinfectant Liquid','Chemical'),('Broom','Equipment'),('Face Mask','Safety'),
('Waste Trolley','Equipment'),('Hand Sanitizer','Chemical');

-- SUPPLIERS
INSERT INTO supplier (name, contact_email, phone) VALUES
('Pak Safety Supplies','sales@paksafety.com','0300-1111111'),
('CleanTech','info@cleantech.com','0311-2222222'),
('Green Plastics','contact@greenplastics.com','0321-3333333'),
('Hygiene Co','support@hygieneco.com','0331-4444444'),
('Urban Equipments','sales@urbanequip.com','0341-5555555');

-- INVENTORY STOCK
INSERT INTO inventory_stock (campus_id, item_id, quantity, reorder_level, unit_price, supplier_id, last_updated) VALUES
(1,1,200,50,25.00,1,'2026-02-01'),(1,2,500,100,15.00,3,'2026-02-01'),
(1,3,50,10,450.00,2,'2026-02-01'),(1,4,100,20,800.00,4,'2026-02-01'),
(1,5,70,15,250.00,2,'2026-02-01'),(2,1,180,40,25.00,1,'2026-02-01'),
(2,2,400,100,15.00,3,'2026-02-01'),(2,6,600,150,5.00,1,'2026-02-01'),
(2,7,20,5,5500.00,5,'2026-02-01'),(3,1,150,30,25.00,1,'2026-02-01'),
(3,2,350,80,15.00,3,'2026-02-01'),(3,4,95,20,800.00,4,'2026-02-01'),
(3,5,65,15,250.00,2,'2026-02-01');

-- WORKER TYPES
INSERT INTO worker_type (type_name) VALUES
('Manager'),('Admin'),('Cleaner');

-- EMPLOYMENT STATUS
INSERT INTO employment_status (status_name) VALUES
('Active'),('Inactive'),('OnLeave');

-- WORKERS
INSERT INTO worker (campus_id,name,CNIC,phone,hire_date,worker_type_id,employment_status_id) VALUES
(1,'Ali Raza','35201-1234567-1','03001234567','2022-01-01',1,1),
(1,'Ahmed Khan','35201-1234567-2','03001234568','2022-02-01',2,1),
(1,'Usman Tariq','35201-1234567-3','03001234569','2023-01-01',3,1),
(1,'Bilal Ahmed','35201-1234567-4','03001234560','2023-03-01',3,1),
(1,'Hassan Ali','35201-1234567-5','03001234561','2023-05-01',3,1),
(2,'Saad Malik','61101-1234567-1','03101234567','2022-01-10',1,1),
(2,'Zain Iqbal','61101-1234567-2','03101234568','2022-02-10',2,1),
(2,'Hamza Shah','61101-1234567-3','03101234569','2023-01-10',3,1),
(2,'Tariq Mehmood','61101-1234567-4','03101234560','2023-04-01',3,1),
(2,'Kashif Ali','61101-1234567-5','03101234561','2023-05-01',3,1),
(3,'Farhan Siddiqui','42101-1234567-1','03201234567','2022-01-15',1,1),
(3,'Imran Baig','42101-1234567-2','03201234568','2022-03-01',2,1),
(3,'Naveed Khan','42101-1234567-3','03201234569','2023-01-15',3,1),
(3,'Adeel Sheikh','42101-1234567-4','03201234560','2023-04-01',3,1),
(3,'Owais Ahmed','42101-1234567-5','03201234561','2023-05-01',3,1),
(1,'Rizwan Ali','35201-1234567-6','03001234562','2023-06-01',3,1),
(2,'Umar Farooq','61101-1234567-6','03101234562','2023-06-01',3,1),
(3,'Danish Khan','42101-1234567-6','03201234562','2023-06-01',3,1),
(1,'Faizan Malik','35201-1234567-7','03001234563','2023-07-01',3,1),
(2,'Shahbaz Ahmed','61101-1234567-7','03101234563','2023-07-01',3,1);

-- WORK SCHEDULES
INSERT INTO work_schedule (worker_id, building_id, shift_date, shift_start_time, shift_end_time) VALUES
(3,1,'2026-02-01','08:00:00','16:00:00'),
(4,2,'2026-02-01','08:00:00','16:00:00'),
(5,3,'2026-02-01','08:00:00','16:00:00'),
(6,4,'2026-02-01','09:00:00','17:00:00'),
(7,5,'2026-02-02','08:00:00','16:00:00'),
(8,6,'2026-02-02','09:00:00','17:00:00'),
(9,7,'2026-02-03','08:00:00','16:00:00'),
(10,8,'2026-02-03','09:00:00','17:00:00'),
(11,9,'2026-02-04','08:00:00','16:00:00'),
(12,10,'2026-02-04','09:00:00','17:00:00'),
(13,11,'2026-02-05','08:00:00','16:00:00'),
(14,12,'2026-02-05','09:00:00','17:00:00');

-- WASTE COLLECTION
INSERT INTO waste_collection (dustbin_id, worker_id, collection_date, collection_time, waste_weight, remarks) VALUES
(1,3,'2026-02-01','10:00:00',35.50,'Normal collection'),
(2,4,'2026-02-01','11:00:00',28.20,'Normal collection'),
(3,5,'2026-02-01','12:00:00',40.00,'Normal collection'),
(4,6,'2026-02-02','08:00:00',50.00,'Overflow detected'),
(5,7,'2026-02-02','09:00:00',30.00,'Normal collection'),
(6,8,'2026-02-03','10:00:00',32.50,'Normal collection'),
(7,9,'2026-02-03','11:00:00',45.00,'Normal collection'),
(8,10,'2026-02-04','08:00:00',20.00,'Chemical bin'),
(9,11,'2026-02-04','09:00:00',60.00,'Normal collection'),
(10,12,'2026-02-05','10:00:00',42.00,'Normal collection');

-- MAINTENANCE STATUS
INSERT INTO maintenance_status (status_name) VALUES
('Pending'),('InProgress'),('Resolved');

-- MAINTENANCE REQUESTS
INSERT INTO maintenance_request (dustbin_id, worker_id, maintenance_date, issue_description, maintenance_status_id) VALUES
(2,3,'2026-02-01','Broken lid',3),
(5,7,'2026-02-02','Overflow issue',2),
(8,10,'2026-02-02','Leakage problem',1),
(11,12,'2026-02-03','Damaged wheels',3),
(14,1,'2026-02-03','Handle broken',2),
(17,5,'2026-02-04','Rusting problem',1);

-- LEAVE TYPES
INSERT INTO leave_type (type_name) VALUES
('Casual'),('Sick'),('Annual');

-- LEAVE STATUS
INSERT INTO leave_status (status_name) VALUES
('Approved'),('Pending'),('Rejected');

-- LEAVE REQUESTS
INSERT INTO leave_request (worker_id, approved_by, leave_start_date, leave_end_date, leave_type_id, leave_status_id, reason, requested_at, actioned_at) VALUES
(3,1,'2026-03-01','2026-03-03',1,1,'Family event','2026-02-20 00:00:00','2026-02-21 00:00:00'),
(4,1,'2026-03-05','2026-03-06',2,1,'Fever','2026-02-22 00:00:00','2026-02-23 00:00:00');

-- PAYMENT STATUS
INSERT INTO payment_status (status_name) VALUES
('Paid'),('Pending');

-- SALARY PAYMENTS
INSERT INTO salary_payment (worker_id, month, year, payment_date, payment_status_id) VALUES
(1,1,2026,'2026-01-31',1),
(2,1,2026,'2026-01-31',1),
(3,1,2026,'2026-01-31',1);

-- SALARY COMPONENTS
INSERT INTO salary_component (payment_id, component_type, amount) VALUES
(1,'Basic',80000),(1,'Bonus',5000),(1,'Deduction',2000),
(2,'Basic',60000),(2,'Bonus',3000),(2,'Deduction',1000),
(3,'Basic',30000),(3,'Bonus',1000),(3,'Deduction',500);

-- DEFAULT USERS
-- Passwords: ali.manager=manager123 | ahmed.admin=admin123 | usman.cleaner=cleaner123
INSERT INTO users (worker_id, username, password_hash, role) VALUES
(1, 'ali.manager',   '$2b$10$wVn4fdUYyERpZbQ1hK11w.W.C9PnBanwrLn8TB7wAHO/ez2UnjDce', 'Manager'),
(2, 'ahmed.admin',   '$2b$10$kYRzn6TU.Ty6DxzTrxDKkOT1KgjCzPNT/AMOmKt9g0aHxbs/JvJr6', 'Admin'),
(3, 'usman.cleaner', '$2b$10$BnU37.sxmHeWtPxE9lGRrO.VRXpMs29JObimialJK2oIfEv1fxuYq', 'Cleaner');

SET FOREIGN_KEY_CHECKS = 1;

-- SET SQL_SAFE_UPDATES = 1;

USE university_db;
SELECT 'buildings' as tbl, COUNT(*) as cnt FROM building
UNION ALL SELECT 'dustbins', COUNT(*) FROM dustbin
UNION ALL SELECT 'workers', COUNT(*) FROM worker
UNION ALL SELECT 'waste_collections', COUNT(*) FROM waste_collection
UNION ALL SELECT 'users', COUNT(*) FROM users;
