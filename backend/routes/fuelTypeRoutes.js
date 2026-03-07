const express = require('express')
const { requireAdmin } = require('../middleware/auth')
const {
  listFuelTypes,
  createFuelType,
  updateFuelType,
  deleteFuelType,
  addStock,
} = require('../controllers/fuelTypeController')

const router = express.Router()

router.use(requireAdmin)

router.get('/', listFuelTypes)
router.post('/', createFuelType)
router.put('/:id', updateFuelType)
router.delete('/:id', deleteFuelType)
router.post('/:id/add-stock', addStock)

module.exports = { fuelTypeRoutes: router }

