/**
 * Migration: Add adminId to existing records for multi-tenant isolation.
 * Assigns all records without adminId to the first admin user.
 * Run once if you have existing data: node scripts/migrateAddAdminId.js
 */
const dotenv = require('dotenv')
dotenv.config()

const { connectDB } = require('../config/db')
const { User } = require('../models/User')
const { Worker } = require('../models/Worker')
const { Machine } = require('../models/Machine')
const { FuelType } = require('../models/FuelType')
const { Activity } = require('../models/Activity')
const { Tanker } = require('../models/Tanker')
const { Sale } = require('../models/Sale')

async function main() {
  await connectDB()

  const admin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 })
  if (!admin) {
    console.log('No admin user found. Create one first with: npm run seed:admin')
    process.exit(1)
  }

  const adminId = admin._id
  console.log(`Using admin: ${admin.email} (${adminId})`)

  const models = [
    { name: 'Worker', Model: Worker },
    { name: 'Machine', Model: Machine },
    { name: 'FuelType', Model: FuelType },
    { name: 'Activity', Model: Activity },
    { name: 'Tanker', Model: Tanker },
    { name: 'Sale', Model: Sale },
  ]

  for (const { name, Model } of models) {
    const result = await Model.updateMany(
      { adminId: { $exists: false } },
      { $set: { adminId } }
    )
    if (result.modifiedCount > 0) {
      console.log(`${name}: assigned adminId to ${result.modifiedCount} record(s)`)
    }
  }

  console.log('Migration complete.')
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
