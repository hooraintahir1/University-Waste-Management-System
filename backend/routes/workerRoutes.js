const express = require('express');
const router = express.Router();
const {
  getAllWorkers, getWorkerById, createWorker, updateWorker, deleteWorker
} = require('../controllers/workerController');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/rbacMiddleware');

router.get('/',    authenticate, authorize('Manager', 'Admin'), getAllWorkers);
router.get('/:id', authenticate, authorize('Manager', 'Admin'), getWorkerById);
router.post('/',   authenticate, authorize('Manager'),           createWorker);
router.put('/:id', authenticate, authorize('Manager', 'Admin'), updateWorker);
router.delete('/:id', authenticate, authorize('Manager'),       deleteWorker);

module.exports = router;
