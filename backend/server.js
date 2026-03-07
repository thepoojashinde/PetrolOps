const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const http = require('http')
const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const { User } = require('./models/User')

dotenv.config()

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  throw new Error('JWT_SECRET must be set and at least 16 characters')
}

const { connectDB } = require('./config/db')
const { errorHandler } = require('./middleware/errorHandler')
const { authRoutes } = require('./routes/authRoutes')
const { requireAdmin } = require('./middleware/auth')
const { fuelTypeRoutes } = require('./routes/fuelTypeRoutes')
const { machineRoutes } = require('./routes/machineRoutes')
const { workerRoutes } = require('./routes/workerRoutes')
const { activityRoutes } = require('./routes/activityRoutes')
const { saleRoutes } = require('./routes/saleRoutes')
const { tankerRoutes } = require('./routes/tankerRoutes')
const { dashboardRoutes } = require("./routes/dashboardRoutes")



const app = express()
app.use(express.json())
app.use(
  cors({
    origin:true,
    credentials: true,
  }),
)

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/fuel-types', fuelTypeRoutes)
app.use('/api/machines', machineRoutes)
app.use('/api/workers', workerRoutes)
app.use('/api/activities', activityRoutes)
app.use('/api/sales', saleRoutes)
app.use('/api/tankers', tankerRoutes)
app.use("/api/dashboard", dashboardRoutes)

app.get('/api/protected/ping', requireAdmin, (req, res) => res.json({ ok: true, user: req.user }))

app.use(errorHandler)

const port = process.env.PORT || 5000
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
})

io.use(async (socket, next) => {
  try {
    const auth = socket.handshake.auth || {}
    const header = socket.handshake.headers.authorization || ''
    const token = auth.token || (header.startsWith('Bearer ') ? header.slice(7) : '')
    if (!token) return next(new Error('Missing token'))
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.sub).select('_id email role')
    if (!user || user.role !== 'admin') return next(new Error('Unauthorized'))
    socket.data.user = { id: user._id.toString(), email: user.email, role: user.role }
    next()
  } catch (e) {
    next(e)
  }
})

io.on('connection', (socket) => {
  socket.join('admins')
  socket.emit('connected', { ok: true, user: socket.data.user })
})

async function start() {
  await connectDB()
  app.set('io', io)
  server.listen(port, () => console.log(`Server listening on :${port}`))
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})

module.exports = { app, io }

