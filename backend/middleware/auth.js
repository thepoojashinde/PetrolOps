const jwt = require('jsonwebtoken')
const { httpError } = require('../utils/httpError')
const { User } = require('../models/User')

async function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : ''
    if (!token) throw httpError(401, 'Missing token')

    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.sub).select('_id email role')
    if (!user) throw httpError(401, 'Invalid token')
    if (user.role !== 'admin') throw httpError(403, 'Forbidden')

    req.user = { id: user._id.toString(), email: user.email, role: user.role }
    next()
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(httpError(401, 'Invalid token'))
    }
    next(err)
  }
}

module.exports = { requireAdmin }

