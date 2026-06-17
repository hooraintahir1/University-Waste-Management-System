
USE university_db;


-- UNIVERSITY


CREATE TABLE university (
    university_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    main_campus_location VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE university_contact (
    contact_id INT AUTO_INCREMENT PRIMARY KEY,
    university_id INT NOT NULL,
    contact_type VARCHAR(50),
    contact_value VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (university_id)
        REFERENCES university(university_id)
        ON DELETE CASCADE
);


-- CAMPUS


CREATE TABLE campus (
    campus_id INT AUTO_INCREMENT PRIMARY KEY,
    university_id INT NOT NULL,
    campus_name VARCHAR(200),
    address VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (university_id)
        REFERENCES university(university_id)
        ON DELETE CASCADE
);

CREATE TABLE campus_contact (
    contact_id INT AUTO_INCREMENT PRIMARY KEY,
    campus_id INT NOT NULL,
    contact_type VARCHAR(50),
    contact_value VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campus_id)
        REFERENCES campus(campus_id)
        ON DELETE CASCADE
);


-- BUILDING


CREATE TABLE building_type (
    building_type_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE building (
    building_id INT AUTO_INCREMENT PRIMARY KEY,
    campus_id INT NOT NULL,
    building_name VARCHAR(200),
    building_type_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campus_id) REFERENCES campus(campus_id),
    FOREIGN KEY (building_type_id)
        REFERENCES building_type(building_type_id)
);


-- DUSTBIN


CREATE TABLE bin_type (
    bin_type_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE dustbin_status (
    dustbin_status_id INT AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(50)
);

CREATE TABLE dustbin (
    dustbin_id INT AUTO_INCREMENT PRIMARY KEY,
    building_id INT NOT NULL,
    bin_type_id INT,
    capacity INT CHECK (capacity >= 0),
    current_fill_level INT CHECK (current_fill_level BETWEEN 0 AND 100),
    last_emptied_date DATE,
    dustbin_status_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES building(building_id),
    FOREIGN KEY (bin_type_id) REFERENCES bin_type(bin_type_id),
    FOREIGN KEY (dustbin_status_id)
        REFERENCES dustbin_status(dustbin_status_id)
);


-- INVENTORY


CREATE TABLE item (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(200),
    item_category VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE supplier (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200),
    contact_email VARCHAR(200),
    phone VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_stock (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    campus_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT CHECK (quantity >= 0),
    reorder_level INT CHECK (reorder_level >= 0),
    unit_price DECIMAL(10,2) CHECK (unit_price >= 0),
    supplier_id INT,
    last_updated DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campus_id) REFERENCES campus(campus_id),
    FOREIGN KEY (item_id) REFERENCES item(item_id),
    FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id)
);


-- WORKER


CREATE TABLE worker_type (
    worker_type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(100)
);

CREATE TABLE employment_status (
    employment_status_id INT AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(50)
);

CREATE TABLE worker (
    worker_id INT AUTO_INCREMENT PRIMARY KEY,
    campus_id INT NOT NULL,
    name VARCHAR(200),
    CNIC VARCHAR(30) UNIQUE,
    phone VARCHAR(50),
    hire_date DATE,
    worker_type_id INT,
    employment_status_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campus_id) REFERENCES campus(campus_id),
    FOREIGN KEY (worker_type_id)
        REFERENCES worker_type(worker_type_id),
    FOREIGN KEY (employment_status_id)
        REFERENCES employment_status(employment_status_id)
);

-- WORK SCHEDULE

CREATE TABLE work_schedule (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    building_id INT NOT NULL,
    shift_date DATE,
    shift_start_time TIME,
    shift_end_time TIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES worker(worker_id),
    FOREIGN KEY (building_id) REFERENCES building(building_id)
);


-- WASTE COLLECTION


CREATE TABLE waste_collection (
    collection_id INT AUTO_INCREMENT PRIMARY KEY,
    dustbin_id INT NOT NULL,
    worker_id INT NOT NULL,
    collection_date DATE,
    collection_time TIME,
    waste_weight DECIMAL(10,2) CHECK (waste_weight >= 0),
    remarks VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dustbin_id) REFERENCES dustbin(dustbin_id),
    FOREIGN KEY (worker_id) REFERENCES worker(worker_id)
);


-- MAINTENANCE


CREATE TABLE maintenance_status (
    maintenance_status_id INT AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(50)
);

CREATE TABLE maintenance_request (
    maintenance_id INT AUTO_INCREMENT PRIMARY KEY,
    dustbin_id INT NOT NULL,
    worker_id INT NOT NULL,
    maintenance_date DATE,
    issue_description VARCHAR(255),
    maintenance_status_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dustbin_id) REFERENCES dustbin(dustbin_id),
    FOREIGN KEY (worker_id) REFERENCES worker(worker_id),
    FOREIGN KEY (maintenance_status_id)
        REFERENCES maintenance_status(maintenance_status_id)
);


-- LEAVE


CREATE TABLE leave_type (
    leave_type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(100)
);

CREATE TABLE leave_status (
    leave_status_id INT AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(50)
);

CREATE TABLE leave_request (
    leave_id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    approved_by INT,
    leave_start_date DATE,
    leave_end_date DATE,
    leave_type_id INT,
    leave_status_id INT,
    reason VARCHAR(255),
    requested_at DATETIME,
    actioned_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES worker(worker_id),
    FOREIGN KEY (approved_by) REFERENCES worker(worker_id),
    FOREIGN KEY (leave_type_id)
        REFERENCES leave_type(leave_type_id),
    FOREIGN KEY (leave_status_id)
        REFERENCES leave_status(leave_status_id)
);


-- SALARY


CREATE TABLE payment_status (
    payment_status_id INT AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(50)
);

CREATE TABLE salary_payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    month INT CHECK (month BETWEEN 1 AND 12),
    year INT,
    payment_date DATE,
    payment_status_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES worker(worker_id),
    FOREIGN KEY (payment_status_id)
        REFERENCES payment_status(payment_status_id)
);

CREATE TABLE salary_component (
    component_id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id INT NOT NULL,
    component_type VARCHAR(100),
    amount DECIMAL(10,2),
    FOREIGN KEY (payment_id)
        REFERENCES salary_payment(payment_id)
        ON DELETE CASCADE
);


-- TRIGGERS


DELIMITER $$

CREATE TRIGGER trg_wc_after_insert
AFTER INSERT ON waste_collection
FOR EACH ROW
BEGIN
    UPDATE dustbin
    SET current_fill_level = 0,
        last_emptied_date = CURRENT_DATE
    WHERE dustbin_id = NEW.dustbin_id;
END$$

CREATE TRIGGER trg_leave_validate
BEFORE INSERT ON leave_request
FOR EACH ROW
BEGIN
    IF NEW.leave_end_date < NEW.leave_start_date THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid leave date range';
    END IF;
END$$

DELIMITER ;


-- VIEWS


CREATE VIEW vw_active_workers_schedule AS
SELECT w.worker_id, w.name,
       c.campus_name,
       b.building_name,
       ws.shift_date,
       ws.shift_start_time,
       ws.shift_end_time
FROM worker w
JOIN campus c ON w.campus_id = c.campus_id
JOIN employment_status es ON w.employment_status_id = es.employment_status_id
LEFT JOIN work_schedule ws ON w.worker_id = ws.worker_id
LEFT JOIN building b ON ws.building_id = b.building_id
WHERE es.status_name = 'Active';

CREATE VIEW vw_pending_maintenance AS
SELECT mr.maintenance_id,
       d.dustbin_id,
       mr.maintenance_date,
       ms.status_name
FROM maintenance_request mr
JOIN maintenance_status ms
    ON mr.maintenance_status_id = ms.maintenance_status_id
JOIN dustbin d ON mr.dustbin_id = d.dustbin_id
WHERE ms.status_name IN ('Pending','InProgress');


-- INDEXES


CREATE INDEX idx_campus_university ON campus(university_id);
CREATE INDEX idx_building_campus ON building(campus_id);
CREATE INDEX idx_worker_campus ON worker(campus_id);
CREATE INDEX idx_dustbin_building ON dustbin(building_id);
CREATE INDEX idx_wc_dustbin_date ON waste_collection(dustbin_id, collection_date);
CREATE INDEX idx_mr_status ON maintenance_request(maintenance_status_id);
CREATE INDEX idx_salary_worker_date ON salary_payment(worker_id, year, month);
CREATE INDEX idx_ws_worker_date ON work_schedule(worker_id, shift_date);
CREATE INDEX idx_leave_worker ON leave_request(worker_id);


CREATE TABLE IF NOT EXISTS users (
    user_id       INT AUTO_INCREMENT PRIMARY KEY,
    worker_id     INT,
    username      VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('Manager','Admin','Cleaner') NOT NULL,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES worker(worker_id) ON DELETE SET NULL
);

USE university_db;
SELECT COUNT(*) FROM building;
SELECT COUNT(*) FROM dustbin;
SELECT COUNT(*) FROM worker;
SELECT user_id, username, role FROM users;
