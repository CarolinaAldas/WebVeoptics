const express = require('express')
const router = express.Router()
const supabase = require('../db')
const { enviarEmailCita } = require('../services/email')
const { generarLinkWhatsApp } = require('../services/whatsapp')

// POST /api/citas — crear nueva cita
router.post('/', async (req, res) => {
  const { nombre, apellido, telefono, email, servicio, fecha, hora, mensaje } = req.body

  // Validación básica
  if (!nombre || !telefono || !servicio) {
    return res.status(400).json({
      ok: false,
      error: 'Nombre, teléfono y servicio son obligatorios'
    })
  }

  try {
    // 1. Guardar en Supabase
    const { data, error } = await supabase
      .from('citas')
      .insert([{ nombre, apellido, telefono, email, servicio, fecha, hora, mensaje }])
      .select()
      .single()

    if (error) throw error

    // 2. Enviar emails (no bloquea si falla)
try {
  await enviarEmailCita({ nombre, apellido, telefono, email, servicio, fecha, hora, mensaje })
} catch (emailErr) {
  console.warn('⚠️ Email falló (no crítico):', emailErr.message)
}
    // 3. Generar link WhatsApp
    const waLink = generarLinkWhatsApp({ nombre, apellido, telefono, email, servicio, fecha, hora, mensaje })

    res.json({
      ok: true,
      cita: data,
      whatsapp: waLink
    })

  } catch (err) {
    console.error('Error al guardar cita:', err.message)
    res.status(500).json({ ok: false, error: 'Error interno del servidor' })
  }
})

// GET /api/citas — listar citas (para admin)
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('citas')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ ok: false, error: error.message })
  res.json({ ok: true, citas: data })
})

module.exports = router