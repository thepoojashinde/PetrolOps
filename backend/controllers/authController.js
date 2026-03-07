const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User } = require('../models/User')
const { httpError } = require('../utils/httpError')

function signToken(user) {
  const now = Math.floor(Date.now() / 1000)
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, iat: now },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  )
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) throw httpError(400, 'Email and password are required')

    const user = await User.findOne({ email: String(email).toLowerCase().trim() })
    if (!user) throw httpError(401, 'Invalid credentials')

    const ok = await bcrypt.compare(String(password), user.passwordHash)
    if (!ok) throw httpError(401, 'Invalid credentials')

    const token = signToken(user)
    res.json({ token, admin: { id: user._id, email: user.email, role: user.role } })
  } catch (err) {
    next(err)
  }
}

async function me(req, res) {
  res.json({ admin: req.user })
}

async function register(req, res, next) {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) throw httpError(400, 'Email and password are required')

    const emailNorm = String(email).toLowerCase().trim()
    if (password.length < 8) throw httpError(400, 'Password must be at least 8 characters')

    const existing = await User.findOne({ email: emailNorm })
    if (existing) throw httpError(409, 'An account with this email already exists')

    const passwordHash = await bcrypt.hash(String(password), 10)
    const user = await User.create({
      email: emailNorm,
      passwordHash,
      role: 'admin',
    })

    const token = signToken(user)
    res.status(201).json({
      token,
      admin: { id: user._id, email: user.email, role: user.role },
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { login, me, register }

