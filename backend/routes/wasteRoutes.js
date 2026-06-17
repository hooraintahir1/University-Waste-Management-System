const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorize   = require('../middleware/rbacMiddleware');
const {
  getAllCollections, getCollectionReport, createCollection,
  getAllDustbins, getFullDustbins, createDustbin, updateDustbin,
  getAllMaintenance, getPendingMaintenance, createMaintenanceRequest, updateMaintenanceStatus,
  getAllPayments, getWorkerSalary, createSalaryPayment,
  getAllLeaveRequests, createLeaveRequest, approveLeave
} = require('../controllers/wasteController');

// --- WASTE COLLECTIONS ---
router.get('/waste-collections/report', authenticate, authorize('Manager', 'Admin'),           getCollectionReport);
router.get('/waste-collections',        authenticate, authorize('Manager', 'Admin', 'Cleaner'), getAllCollections);
router.post('/waste-collections',       authenticate, authorize('Manager', 'Admin', 'Cleaner'), createCollection);

// --- DUSTBINS ---
router.get('/dustbins/full', authenticate, authorize('Manager', 'Admin', 'Cleaner'), getFullDustbins);
router.get('/dustbins',      authenticate, authorize('Manager', 'Admin', 'Cleaner'), getAllDustbins);
router.post('/dustbins',     authenticate, authorize('Manager', 'Admin'),            createDustbin);
router.put('/dustbins/:id',  authenticate, authorize('Manager', 'Admin'),            updateDustbin);

// --- MAINTENANCE ---
router.get('/maintenance/pending', authenticate, authorize('Manager', 'Admin', 'Cleaner'), getPendingMaintenance);
router.get('/maintenance',         authenticate, authorize('Manager', 'Admin'),            getAllMaintenance);
router.post('/maintenance',        authenticate, authorize('Manager', 'Admin', 'Cleaner'), createMaintenanceRequest);
router.put('/maintenance/:id',     authenticate, authorize('Manager', 'Admin'),            updateMaintenanceStatus);

// --- SALARY ---
router.get('/salary',             authenticate, authorize('Manager'),        getAllPayments);
router.get('/salary/worker/:id',  authenticate, authorize('Manager','Admin'), getWorkerSalary);
router.post('/salary',            authenticate, authorize('Manager'),        createSalaryPayment);

// --- LEAVE ---
router.get('/leave',              authenticate, authorize('Manager', 'Admin'),           getAllLeaveRequests);
router.post('/leave',             authenticate, authorize('Manager', 'Admin', 'Cleaner'), createLeaveRequest);
router.put('/leave/:id/approve',  authenticate, authorize('Manager'),                    approveLeave);

module.exports = router;
