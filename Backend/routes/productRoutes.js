const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(protect, getProducts)
    .post(protect, adminOnly, upload.single('image'), createProduct);

router.route('/:id')
    .get(protect, getProductById)
    .put(protect, upload.single('image'), updateProduct)
    .delete(protect, adminOnly, deleteProduct);

module.exports = router;
