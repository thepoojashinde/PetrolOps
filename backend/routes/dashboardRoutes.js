const express = require("express")
const router = express.Router()
const { requireAdmin } = require("../middleware/auth")
const { getDashboardStats } = require("../controllers/dashboardController")

router.get("/stats", requireAdmin, getDashboardStats)

module.exports = { dashboardRoutes: router }