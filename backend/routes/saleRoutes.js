const express = require('express')
const { requireAdmin } = require('../middleware/auth')
const { listSales, createSale, updateSale, deleteSale } = require('../controllers/saleController')

const router = express.Router()
router.use(requireAdmin)

router.get('/', listSales)
router.post('/', createSale)
router.put('/:id', updateSale)
router.delete('/:id', deleteSale)

module.exports = { saleRoutes: router }

