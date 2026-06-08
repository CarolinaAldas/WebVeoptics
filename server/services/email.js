const nodemailer = require('nodemailer')
require('dotenv').config()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

async function enviarEmailCita(cita) {
  // Email al consultorio
  await transporter.sendMail({
    from: `"VeoOptics Web" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject: `📅 Nueva cita — ${cita.nombre} ${cita.apellido}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto">
        <h2 style="color:#5BB8D4">Nueva solicitud de cita</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;color:#666">Nombre</td>
              <td style="padding:8px"><b>${cita.nombre} ${cita.apellido}</b></td></tr>
          <tr style="background:#f9f9f9">
              <td style="padding:8px;color:#666">Teléfono</td>
              <td style="padding:8px"><b>${cita.telefono}</b></td></tr>
          <tr><td style="padding:8px;color:#666">Email</td>
              <td style="padding:8px">${cita.email || '—'}</td></tr>
          <tr style="background:#f9f9f9">
              <td style="padding:8px;color:#666">Servicio</td>
              <td style="padding:8px"><b>${cita.servicio}</b></td></tr>
          <tr><td style="padding:8px;color:#666">Fecha</td>
              <td style="padding:8px">${cita.fecha || '—'}</td></tr>
          <tr style="background:#f9f9f9">
              <td style="padding:8px;color:#666">Hora</td>
              <td style="padding:8px">${cita.hora || '—'}</td></tr>
          <tr><td style="padding:8px;color:#666">Mensaje</td>
              <td style="padding:8px">${cita.mensaje || '—'}</td></tr>
        </table>
        <p style="color:#999;font-size:12px;margin-top:24px">
          Enviado desde veoptics-ecuador.com
        </p>
      </div>
    `
  })

  // Email de confirmación al cliente
  if (cita.email) {
    await transporter.sendMail({
      from: `"VeoOptics" <${process.env.EMAIL_USER}>`,
      to: cita.email,
      subject: '✅ Tu cita en VeoOptics fue recibida',
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:auto">
          <h2 style="color:#5BB8D4">¡Hola, ${cita.nombre}!</h2>
          <p>Recibimos tu solicitud de cita para <b>${cita.servicio}</b>.</p>
          <p>Nos comunicaremos contigo pronto al número <b>${cita.telefono}</b> para confirmar.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
          <p style="color:#666;font-size:13px">
            📍 Pío Bravo 2-15 y Manuel Vega, Cuenca<br>
            🕐 Lun–Vie 9:00–18:00 | Sáb 9:00–13:00
          </p>
        </div>
      `
    })
  }
}

module.exports = { enviarEmailCita }