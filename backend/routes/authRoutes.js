const express = require('express')
const { login, me, register } = require('../controllers/authController')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()

router.post('/login', login)
router.post('/register', register)
router.get('/me', requireAdmin, me)

module.exports = { authRoutes: router }

