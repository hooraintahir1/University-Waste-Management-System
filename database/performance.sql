USE university_db;

 --  QUERY 1: Waste Collection Report Per Dustbin Per Date

DROP INDEX idx_wc_dustbin_date ON waste_collection;

EXPLAIN ANALYZE
SELECT dustbin_id,
       collection_date,
       SUM(waste_weight) AS total_weight
FROM waste_collection
WHERE dustbin_id = 5
AND collection_date BETWEEN '2026-02-01' AND '2026-02-28'
GROUP BY dustbin_id, collection_date;

CREATE INDEX idx_wc_dustbin_date
ON waste_collection(dustbin_id, collection_date);

EXPLAIN ANALYZE
SELECT dustbin_id,
       collection_date,
       SUM(waste_weight) AS total_weight
FROM waste_collection
WHERE dustbin_id = 5
AND collection_date BETWEEN '2026-02-01' AND '2026-02-28'
GROUP BY dustbin_id, collection_date;

  -- QUERY 2: Monthly Salary Lookup Per Worker

DROP INDEX idx_salary_worker_date ON salary_payment;

EXPLAIN ANALYZE
SELECT sp.worker_id,
       sp.month,
       sp.year,
       sp.payment_date,
       ps.status_name
FROM salary_payment sp
JOIN payment_status ps
    ON sp.payment_status_id = ps.payment_status_id
WHERE sp.worker_id = 1
AND sp.year = 2026
ORDER BY sp.month;

CREATE INDEX idx_salary_worker_date
ON salary_payment(worker_id, year, month);

EXPLAIN ANALYZE
SELECT sp.worker_id,
       sp.month,
       sp.year,
       sp.payment_date,
       ps.status_name
FROM salary_payment sp
JOIN payment_status ps
    ON sp.payment_status_id = ps.payment_status_id
WHERE sp.worker_id = 1
AND sp.year = 2026
ORDER BY sp.month;

--   QUERY 3: Worker Schedule Lookup

DROP INDEX idx_ws_worker_date ON work_schedule;

EXPLAIN ANALYZE
SELECT ws.worker_id,
       w.name,
       ws.shift_date,
       ws.shift_start_time,
       ws.shift_end_time
FROM work_schedule ws
JOIN worker w
    ON ws.worker_id = w.worker_id
WHERE ws.worker_id = 3
AND ws.shift_date BETWEEN '2026-02-01' AND '2026-02-10';

CREATE INDEX idx_ws_worker_date
ON work_schedule(worker_id, shift_date);

EXPLAIN ANALYZE
SELECT ws.worker_id,
       w.name,
       ws.shift_date,
       ws.shift_start_time,
       ws.shift_end_time
FROM work_schedule ws
JOIN worker w
    ON ws.worker_id = w.worker_id
WHERE ws.worker_id = 3
AND ws.shift_date BETWEEN '2026-02-01' AND '2026-02-10';



/* ======================================================
   QUERY 4 (Extra): Pending Maintenance Lookup
   Purpose:
   Dashboard query for supervisors
   ====================================================== */

DROP INDEX idx_mr_status ON maintenance_request;

-- BEFORE INDEX
EXPLAIN ANALYZE
SELECT mr.maintenance_id,
       d.dustbin_id,
       ms.status_name
FROM maintenance_request mr
JOIN maintenance_status ms
    ON mr.maintenance_status_id = ms.maintenance_status_id
JOIN dustbin d
    ON mr.dustbin_id = d.dustbin_id
WHERE ms.status_name = 'Pending';


-- Recreate index
CREATE INDEX idx_mr_status
ON maintenance_request(maintenance_status_id);

-- AFTER INDEX
EXPLAIN ANALYZE
SELECT mr.maintenance_id,
       d.dustbin_id,
       ms.status_name
FROM maintenance_request mr
JOIN maintenance_status ms
    ON mr.maintenance_status_id = ms.maintenance_status_id
JOIN dustbin d
    ON mr.dustbin_id = d.dustbin_id
WHERE ms.status_name = 'Pending';
