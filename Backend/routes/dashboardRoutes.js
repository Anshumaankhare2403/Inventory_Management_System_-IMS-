const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getLowStockProducts
} = require('../controllers/dashboardController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/stats')
    .get(protect, adminOnly, getDashboardStats);

router.route('/low-stock')
    .get(protect, adminOnly, getLowStockProducts);

router.route('/staff')
    .get(protect, require('../controllers/dashboardController').getStaffStats);

module.exports = router;
