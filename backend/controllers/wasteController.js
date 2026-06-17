const pool = require('../config/db');
const { recordWasteCollection, processSalaryPayment } = require('../transactions/wasteTransaction');

// GET /api/v1/waste-collections
const getAllCollections = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT wc.collection_id,
             wc.dustbin_id,
             wc.worker_id,
             wc.collection_date,
             wc.collection_time,
             wc.waste_weight,
             wc.remarks,
             w.name AS worker_name
      FROM   waste_collection wc
      JOIN   worker w ON wc.worker_id = w.worker_id
      ORDER  BY wc.collection_date DESC
    `);
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/v1/waste-collections/report?dustbin_id=&from=&to=
const getCollectionReport = async (req, res) => {
  const { dustbin_id, from, to } = req.query;

  if (!dustbin_id || !from || !to) {
    return res.status(400).json({ error: 'dustbin_id, from and to query params are required' });
  }

  try {
    const [rows] = await pool.execute(`
      SELECT   dustbin_id,
               collection_date,
               SUM(waste_weight) AS total_weight
      FROM     waste_collection
      WHERE    dustbin_id     = ?
        AND    collection_date BETWEEN ? AND ?
      GROUP BY dustbin_id, collection_date
      ORDER BY collection_date
    `, [dustbin_id, from, to]);

    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/v1/waste-collections
const createCollection = async (req, res) => {
  const { dustbin_id, worker_id, collection_date, collection_time, waste_weight, remarks } = req.body;

  if (!dustbin_id || !worker_id || !collection_date || waste_weight === undefined) {
    return res.status(400).json({ error: 'dustbin_id, worker_id, collection_date and waste_weight are required' });
  }

  try {
    const result = await recordWasteCollection({
      dustbin_id, worker_id, collection_date, collection_time, waste_weight, remarks
    });
    return res.status(201).json({
      message: 'Waste collection recorded successfully',
      collection_id: result.collection_id
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/v1/dustbins
const getAllDustbins = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT d.dustbin_id,
             d.capacity,
             d.current_fill_level,
             d.last_emptied_date,
             bt.name        AS bin_type,
             ds.status_name AS status,
             b.building_name,
             c.campus_name
      FROM   dustbin d
      JOIN   bin_type        bt ON d.bin_type_id        = bt.bin_type_id
      JOIN   dustbin_status  ds ON d.dustbin_status_id  = ds.dustbin_status_id
      JOIN   building         b ON d.building_id        = b.building_id
      JOIN   campus           c ON b.campus_id          = c.campus_id
      ORDER  BY d.dustbin_id
    `);
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/v1/dustbins/full
const getFullDustbins = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT d.dustbin_id,
             d.current_fill_level,
             b.building_name,
             c.campus_name
      FROM   dustbin  d
      JOIN   building b ON d.building_id = b.building_id
      JOIN   campus   c ON b.campus_id   = c.campus_id
      WHERE  d.current_fill_level >= 80
      ORDER  BY d.current_fill_level DESC
    `);
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/v1/dustbins
const createDustbin = async (req, res) => {
  const { building_id, bin_type_id, capacity, current_fill_level, dustbin_status_id } = req.body;

  if (!building_id || !bin_type_id || !capacity) {
    return res.status(400).json({ error: 'building_id, bin_type_id and capacity are required' });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO dustbin (building_id, bin_type_id, capacity, current_fill_level, dustbin_status_id)
       VALUES (?, ?, ?, ?, ?)`,
      [building_id, bin_type_id, capacity, current_fill_level || 0, dustbin_status_id || 1]
    );
    return res.status(201).json({ message: 'Dustbin created', dustbin_id: result.insertId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// PUT /api/v1/dustbins/:id
const updateDustbin = async (req, res) => {
  const { id } = req.params;
  const { current_fill_level, dustbin_status_id } = req.body;

  try {
    const [result] = await pool.execute(
      `UPDATE dustbin
       SET current_fill_level = COALESCE(?, current_fill_level),
           dustbin_status_id  = COALESCE(?, dustbin_status_id)
       WHERE dustbin_id = ?`,
      [current_fill_level ?? null, dustbin_status_id ?? null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Dustbin not found' });
    }
    return res.status(200).json({ message: 'Dustbin updated successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/v1/maintenance
const getAllMaintenance = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT mr.maintenance_id,
             mr.dustbin_id,
             mr.maintenance_date,
             mr.issue_description,
             ms.status_name,
             w.name AS reported_by
      FROM   maintenance_request mr
      JOIN   maintenance_status ms ON mr.maintenance_status_id = ms.maintenance_status_id
      JOIN   worker              w  ON mr.worker_id            = w.worker_id
      ORDER  BY mr.maintenance_date DESC
    `);
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/v1/maintenance/pending
const getPendingMaintenance = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT mr.maintenance_id,
             d.dustbin_id,
             mr.maintenance_date,
             ms.status_name,
             mr.issue_description
      FROM   maintenance_request mr
      JOIN   maintenance_status ms ON mr.maintenance_status_id = ms.maintenance_status_id
      JOIN   dustbin              d ON mr.dustbin_id           = d.dustbin_id
      WHERE  ms.status_name IN ('Pending', 'InProgress')
    `);
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/v1/maintenance
const createMaintenanceRequest = async (req, res) => {
  const { dustbin_id, worker_id, maintenance_date, issue_description } = req.body;

  if (!dustbin_id || !worker_id || !issue_description) {
    return res.status(400).json({ error: 'dustbin_id, worker_id and issue_description are required' });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO maintenance_request
         (dustbin_id, worker_id, maintenance_date, issue_description, maintenance_status_id)
       VALUES (?, ?, ?, ?, 1)`,
      [dustbin_id, worker_id, maintenance_date || new Date().toISOString().slice(0, 10), issue_description]
    );

    await pool.execute(
      'UPDATE dustbin SET dustbin_status_id = 4 WHERE dustbin_id = ?',
      [dustbin_id]
    );

    return res.status(201).json({
      message: 'Maintenance request created',
      maintenance_id: result.insertId
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// PUT /api/v1/maintenance/:id
const updateMaintenanceStatus = async (req, res) => {
  const { id } = req.params;
  const { maintenance_status_id } = req.body;

  if (!maintenance_status_id) {
    return res.status(400).json({ error: 'maintenance_status_id is required' });
  }

  try {
    const [result] = await pool.execute(
      'UPDATE maintenance_request SET maintenance_status_id = ? WHERE maintenance_id = ?',
      [maintenance_status_id, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }
    return res.status(200).json({ message: 'Maintenance status updated' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/v1/salary
const getAllPayments = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT sp.payment_id,
             sp.worker_id,
             w.name  AS worker_name,
             sp.month,
             sp.year,
             sp.payment_date,
             ps.status_name AS payment_status
      FROM   salary_payment  sp
      JOIN   worker           w  ON sp.worker_id        = w.worker_id
      JOIN   payment_status   ps ON sp.payment_status_id = ps.payment_status_id
      ORDER  BY sp.year DESC, sp.month DESC
    `);
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/v1/salary/worker/:id?year=
const getWorkerSalary = async (req, res) => {
  const { id } = req.params;
  const { year } = req.query;

  try {
    const [rows] = await pool.execute(`
      SELECT sp.payment_id, sp.month, sp.year,
             sp.payment_date, ps.status_name
      FROM   salary_payment sp
      JOIN   payment_status ps ON sp.payment_status_id = ps.payment_status_id
      WHERE  sp.worker_id = ?
        AND  sp.year      = ?
      ORDER  BY sp.month
    `, [id, year || new Date().getFullYear()]);
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/v1/salary
const createSalaryPayment = async (req, res) => {
  const { worker_id, month, year, payment_date, components } = req.body;

  if (!worker_id || !month || !year || !Array.isArray(components) || components.length === 0) {
    return res.status(400).json({ error: 'worker_id, month, year and components[] are required' });
  }

  try {
    const result = await processSalaryPayment({ worker_id, month, year, payment_date, components });
    return res.status(201).json({
      message: 'Salary payment recorded successfully',
      payment_id: result.payment_id
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// GET /api/v1/leave
const getAllLeaveRequests = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT lr.leave_id,
             lr.worker_id,
             w.name          AS worker_name,
             lr.leave_start_date,
             lr.leave_end_date,
             lt.type_name    AS leave_type,
             ls.status_name  AS leave_status,
             lr.reason
      FROM   leave_request lr
      JOIN   worker      w  ON lr.worker_id     = w.worker_id
      JOIN   leave_type  lt ON lr.leave_type_id = lt.leave_type_id
      JOIN   leave_status ls ON lr.leave_status_id = ls.leave_status_id
      ORDER  BY lr.leave_start_date DESC
    `);
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/v1/leave
const createLeaveRequest = async (req, res) => {
  const { worker_id, leave_start_date, leave_end_date, leave_type_id, reason } = req.body;

  if (!worker_id || !leave_start_date || !leave_end_date || !leave_type_id) {
    return res.status(400).json({ error: 'worker_id, leave_start_date, leave_end_date and leave_type_id are required' });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO leave_request
         (worker_id, leave_start_date, leave_end_date, leave_type_id, leave_status_id, reason, requested_at)
       VALUES (?, ?, ?, ?, 2, ?, NOW())`,
      [worker_id, leave_start_date, leave_end_date, leave_type_id, reason || null]
    );
    return res.status(201).json({ message: 'Leave request submitted', leave_id: result.insertId });
  } catch (err) {
    if (err.message.includes('Invalid leave date range')) {
      return res.status(400).json({ error: 'End date cannot be before start date' });
    }
    return res.status(500).json({ error: err.message });
  }
};

// PUT /api/v1/leave/:id/approve
const approveLeave = async (req, res) => {
  const { id } = req.params;
  const { leave_status_id } = req.body;
  const approver_id = req.user.worker_id;

  if (!leave_status_id) {
    return res.status(400).json({ error: 'leave_status_id required (1=Approved, 3=Rejected)' });
  }

  try {
    const [result] = await pool.execute(
      `UPDATE leave_request
       SET leave_status_id = ?,
           approved_by     = ?,
           actioned_at     = NOW()
       WHERE leave_id = ?`,
      [leave_status_id, approver_id, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    return res.status(200).json({ message: 'Leave request updated successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllCollections, getCollectionReport, createCollection,
  getAllDustbins, getFullDustbins, createDustbin, updateDustbin,
  getAllMaintenance, getPendingMaintenance, createMaintenanceRequest, updateMaintenanceStatus,
  getAllPayments, getWorkerSalary, createSalaryPayment,
  getAllLeaveRequests, createLeaveRequest, approveLeave
};
