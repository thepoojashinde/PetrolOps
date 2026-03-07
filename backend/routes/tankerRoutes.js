const express = require('express')
const { requireAdmin } = require('../middleware/auth')
const { listTankers, createTanker, updateTanker, deleteTanker } = require('../controllers/tankerController')

const router = express.Router()
router.use(requireAdmin)

router.get('/', listTankers)
router.post('/', createTanker)
router.put('/:id', updateTanker)
router.delete('/:id', deleteTanker)

module.exports = { tankerRoutes: router }

