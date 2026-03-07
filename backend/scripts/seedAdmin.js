const dotenv = require('dotenv')
const bcrypt = require('bcryptjs')
dotenv.config()

const { connectDB } = require('../config/db')
const { User } = require('../models/User')

async function main() {
  await connectDB()

  const email = (process.env.ADMIN_EMAIL || 'admin@petrolops.local').toLowerCase().trim()
  const password = process.env.ADMIN_PASSWORD || 'Admin@123'

  const existing = await User.findOne({ email })
  if (existing) {
    console.log(`Admin already exists: ${email}`)
    process.exit(0)
  }

  const passwordHash = await bcrypt.hash(password, 10)
  await User.create({ email, passwordHash, role: 'admin' })
  console.log(`Seeded admin: ${email}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

