require('dotenv').config()

function generarLinkWhatsApp(cita) {
  const mensaje = `
🗓 *Nueva cita VeoOptics*
──────────────────
👤 *Nombre:* ${cita.nombre} ${cita.apellido || ''}
📞 *Teléfono:* ${cita.telefono}
📧 *Email:* ${cita.email || '—'}
🔍 *Servicio:* ${cita.servicio}
📅 *Fecha:* ${cita.fecha || 'Por confirmar'}
⏰ *Hora:* ${cita.hora || 'Por confirmar'}
💬 *Mensaje:* ${cita.mensaje || '—'}
  `.trim()

  const encoded = encodeURIComponent(mensaje)
  return `https://wa.me/${process.env.WA_NUMBER}?text=${encoded}`
}

module.exports = { generarLinkWhatsApp }