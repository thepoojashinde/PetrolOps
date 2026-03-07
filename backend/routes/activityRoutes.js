const express = require('express')
const { requireAdmin } = require('../middleware/auth')
const { listActiveActivities, startActivity, stopActivity } = require('../controllers/activityController')

const router = express.Router()
router.use(requireAdmin)

router.get('/active', listActiveActivities)
router.post('/start', startActivity)
router.post('/:activityId/stop', stopActivity)

module.exports = { activityRoutes: router }

