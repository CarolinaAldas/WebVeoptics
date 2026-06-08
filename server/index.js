const express = require('express')
const cors = require('cors')
require('dotenv').config()

const citasRouter = require('./routes/citas')

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.static('public'))  // sirve tu frontend

// Rutas API
app.use('/api/citas', citasRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, mensaje: 'VeoOptics API corriendo' })
})

// Inicia servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`)
})