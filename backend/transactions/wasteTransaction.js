const pool = require('../config/db');

// TRANSACTION: record waste collection + reset dustbin fill level
const recordWasteCollection = async ({ dustbin_id, worker_id, collection_date, collection_time, waste_weight, remarks }) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();
    console.log('[TRANSACTION] BEGIN — recordWasteCollection');

    // 1. Verify dustbin exists
    const [dustbin] = await conn.execute(
      'SELECT dustbin_id, current_fill_level FROM dustbin WHERE dustbin_id = ?',
      [dustbin_id]
    );
    if (dustbin.length === 0) {
      throw new Error('Dustbin not found');
    }
    console.log(`[TRANSACTION] Dustbin id=${dustbin_id} found, fill_level=${dustbin[0].current_fill_level}`);

    // 2. Insert waste collection record
    const [insertResult] = await conn.execute(
      `INSERT INTO waste_collection
         (dustbin_id, worker_id, collection_date, collection_time, waste_weight, remarks)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [dustbin_id, worker_id, collection_date, collection_time || null, waste_weight, remarks || null]
    );
    console.log(`[TRANSACTION] Inserted waste_collection id=${insertResult.insertId}`);

    // 3. Reset dustbin fill level to 0 and update last_emptied_date
    await conn.execute(
      `UPDATE dustbin
       SET current_fill_level = 0,
           last_emptied_date  = ?
       WHERE dustbin_id = ?`,
      [collection_date, dustbin_id]
    );
    console.log(`[TRANSACTION] Updated dustbin id=${dustbin_id} — fill_level reset to 0`);

    await conn.commit();
    console.log('[TRANSACTION] COMMIT — recordWasteCollection SUCCESS');

    return { success: true, collection_id: insertResult.insertId };
  } catch (err) {
    await conn.rollback();
    console.log('[TRANSACTION] ROLLBACK — recordWasteCollection FAILED:', err.message);
    throw err;
  } finally {
    conn.release();
  }
};

// TRANSACTION: process salary payment + all salary components atomically
const processSalaryPayment = async ({ worker_id, month, year, payment_date, components }) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();
    console.log('[TRANSACTION] BEGIN — processSalaryPayment');

    // 1. Check for duplicate payment
    const [existing] = await conn.execute(
      'SELECT payment_id FROM salary_payment WHERE worker_id = ? AND month = ? AND year = ?',
      [worker_id, month, year]
    );
    if (existing.length > 0) {
      throw new Error('Salary already processed for this worker in the given month/year');
    }

    // 2. Insert salary payment record
    const [payResult] = await conn.execute(
      `INSERT INTO salary_payment (worker_id, month, year, payment_date, payment_status_id)
       VALUES (?, ?, ?, ?, 1)`,
      [worker_id, month, year, payment_date || new Date().toISOString().slice(0, 10)]
    );
    const paymentId = payResult.insertId;
    console.log(`[TRANSACTION] Inserted salary_payment id=${paymentId}`);

    // 3. Insert each salary component
    for (const comp of components) {
      if (!comp.component_type || comp.amount === undefined) {
        throw new Error('Each component must have component_type and amount');
      }
      await conn.execute(
        `INSERT INTO salary_component (payment_id, component_type, amount) VALUES (?, ?, ?)`,
        [paymentId, comp.component_type, comp.amount]
      );
      console.log(`[TRANSACTION] Inserted component: ${comp.component_type} = ${comp.amount}`);
    }

    await conn.commit();
    console.log('[TRANSACTION] COMMIT — processSalaryPayment SUCCESS');

    return { success: true, payment_id: paymentId };
  } catch (err) {
    await conn.rollback();
    console.log('[TRANSACTION] ROLLBACK — processSalaryPayment FAILED:', err.message);
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = { recordWasteCollection, processSalaryPayment };
