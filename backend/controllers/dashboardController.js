const mongoose = require("mongoose")
const { Sale } = require("../models/Sale")
const { Worker } = require("../models/Worker")
const { Machine } = require("../models/Machine")
const { FuelType } = require("../models/FuelType")

exports.getDashboardStats = async (req, res) => {
  try {
    const adminId = new mongoose.Types.ObjectId(req.user.id)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const matchAdmin = { $match: { adminId: adminId } }

    const [todaySalesRes, totalRevenueRes, activeWorkers, activeMachines, dailyTrend, monthlyRevenue, fuelTypes] = await Promise.all([
      Sale.aggregate([
        matchAdmin,
        { $match: { createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Sale.aggregate([
        matchAdmin,
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Worker.countDocuments({ adminId, isWorking: true }),
      Machine.countDocuments({ adminId, isActive: true }),
      (() => {
        const start = new Date(today)
        start.setDate(start.getDate() - 6)
        start.setHours(0, 0, 0, 0)
        return Sale.aggregate([
          matchAdmin,
          { $match: { createdAt: { $gte: start } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              total: { $sum: "$amount" },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ])
      })(),
      Sale.aggregate([
        matchAdmin,
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            total: { $sum: "$amount" }
          }
        },
        { $sort: { _id: -1 } },
        { $limit: 6 }
      ]),
      FuelType.find({ adminId, isActive: true }).select('name currentStockLiters lowStockThreshold').lean()
    ])

    const todaySales = todaySalesRes[0]?.total ?? 0
    const totalRevenue = totalRevenueRes[0]?.total ?? 0

    const inventory = fuelTypes.map((f) => ({
      name: f.name,
      currentStockLiters: f.currentStockLiters ?? 0,
      lowStockThreshold: f.lowStockThreshold ?? 0,
      isLow: (f.currentStockLiters ?? 0) <= (f.lowStockThreshold ?? 0)
    }))

    res.json({
      todaySales: Number(todaySales.toFixed(2)),
      totalRevenue: Number(totalRevenue.toFixed(2)),
      activeWorkers,
      activeMachines,
      dailyTrend: dailyTrend.map((d) => ({ date: d._id, total: d.total, count: d.count })),
      monthlyRevenue: monthlyRevenue.map((m) => ({
        year: m._id.year,
        month: m._id.month,
        total: m.total
      })),
      inventory
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}