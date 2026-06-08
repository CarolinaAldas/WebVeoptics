// ── Cursor ──
var cursor     = document.getElementById('cursor')
var cursorRing = document.getElementById('cursor-ring')
var cx = 0, cy = 0, rx = 0, ry = 0

window.addEventListener('mousemove', function(e) {
  cx = e.clientX
  cy = e.clientY
})

;(function animCursor() {
  requestAnimationFrame(animCursor)
  rx += (cx - rx) * 0.13
  ry += (cy - ry) * 0.13
  cursor.style.left      = cx + 'px'
  cursor.style.top       = cy + 'px'
  cursorRing.style.left  = rx + 'px'
  cursorRing.style.top   = ry + 'px'
})()

// ── Slides horizontal ──
var currentSlide = 0
var totalSlides  = 6
var isAnimating  = false
var container    = document.getElementById('slides-container')
var dots         = document.querySelectorAll('.dot')

function goTo(index) {
  if (isAnimating) return
  if (index < 0 || index >= totalSlides) return
  if (index === currentSlide) return

  isAnimating = true
  currentSlide = index

  var isMobile = window.innerWidth <= 768

  if (isMobile) {
    // En móvil scroll vertical
    container.style.transform = 'translateY(-' + (currentSlide * 100) + 'vh)'
  } else {
    // En desktop scroll horizontal
    container.style.transform = 'translateX(-' + (currentSlide * 100) + 'vw)'
  }

  dots.forEach(function(d, i) {
    d.classList.toggle('active', i === currentSlide)
  })

  updateActiveSlide()

  document.getElementById('navbar')
    .classList.toggle('solid', currentSlide > 0)

  setTimeout(function() { isAnimating = false }, 900)
}



function updateActiveSlide() {
  document.querySelectorAll('.slide').forEach(function(s, i) {
    s.classList.toggle('active', i === currentSlide)
  })
}

// Activar primer slide al cargar
setTimeout(function() {
  updateActiveSlide()
}, 100)

// ── Wheel / trackpad ──
var wheelAccum = 0
var wheelTimer = null

window.addEventListener('wheel', function(e) {
  e.preventDefault()
  wheelAccum += e.deltaY

  clearTimeout(wheelTimer)
  wheelTimer = setTimeout(function() {
    if (Math.abs(wheelAccum) > 50) {
      if (wheelAccum > 0) goTo(currentSlide + 1)
      else                goTo(currentSlide - 1)
    }
    wheelAccum = 0
  }, 60)
}, { passive: false })

// ── Teclado ──
window.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(currentSlide + 1)
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goTo(currentSlide - 1)
})

// ── Touch / swipe ──
var touchStartX = 0
var touchStartY = 0

window.addEventListener('touchstart', function(e) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}, { passive: true })

window.addEventListener('touchend', function(e) {
  var dx = touchStartX - e.changedTouches[0].clientX
  var dy = touchStartY - e.changedTouches[0].clientY
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
    if (dx > 0) goTo(currentSlide + 1)
    else        goTo(currentSlide - 1)
  }
}, { passive: true })

// ── Productos tabs ──
var tabData = [
  {
    desc: 'Amplia selección de armazones para adultos y niños. Marcas nacionales e importadas con materiales de alta durabilidad.',
    tags: ['Acetato','Titanio','TR-90','Metal','Infantil'],
    label: 'Monturas Oftálmicas'
  },
  {
    desc: 'Protección UV400 certificada. Polarizados, fotocromáticos y de colores. Desde deportivos hasta moda de autor.',
    tags: ['UV400','Polarizados','Fotocromáticos','Deportivos','Moda'],
    label: 'Lentes de Sol'
  },
  {
    desc: 'Adaptación personalizada con seguimiento profesional. Diarias, mensuales y anuales para todo tipo de corrección.',
    tags: ['Diarios','Mensuales','Astigmatismo','Presbicia','Colorados'],
    label: 'Lentes de Contacto'
  },
  {
    desc: 'Antirreflejo, Transitions, filtros de luz azul y tratamientos especiales para mayor durabilidad y confort visual.',
    tags: ['Antirreflejo','Transitions','Luz azul','Endurecido','HD Digital'],
    label: 'Cristales Especiales'
  }
]

function setTab(btn, idx) {
  document.querySelectorAll('.ptab').forEach(function(t) {
    t.classList.remove('active')
  })
  btn.classList.add('active')

  var desc  = document.getElementById('ptab-desc')
  var tags  = document.getElementById('ptab-tags')
  var label = document.getElementById('showcase-label')

  desc.style.opacity = '0'
  setTimeout(function() {
    var p = tabData[idx]
    desc.textContent  = p.desc
    tags.innerHTML    = p.tags
      .map(function(t) { return '<span class="tag">' + t + '</span>' })
      .join('')
    if (label) label.textContent = p.label
    desc.style.opacity = '1'
    desc.style.transition = 'opacity .3s'
  }, 160)
}

// ── Formulario citas → API ──
async function enviarCita(event) {
  event.preventDefault()

  var btn      = document.getElementById('btn-submit')
  var feedback = document.getElementById('form-feedback')

  var cita = {
    nombre:   document.getElementById('f-nombre').value.trim(),
    telefono: document.getElementById('f-telefono').value.trim(),
    servicio: document.getElementById('f-servicio').value,
    fecha:    document.getElementById('f-fecha').value,
    email:    document.getElementById('f-email').value.trim()
  }

  btn.textContent    = 'Enviando...'
  btn.disabled       = true
  btn.style.opacity  = '0.6'
  feedback.style.display = 'none'
  feedback.className = ''

  try {
    var res  = await fetch('/api/citas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cita)
    })
    var data = await res.json()

    if (data.ok) {
      feedback.className     = 'success'
      feedback.style.display = 'block'
      feedback.innerHTML =
        '✅ ¡Cita registrada!<br>' +
        '<small>Te contactaremos al ' + cita.telefono + '</small><br><br>' +
        '<a href="' + data.whatsapp + '" target="_blank" ' +
        'style="color:var(--blue);font-size:.76rem">' +
        '📱 Confirmar por WhatsApp →</a>'
      document.getElementById('form-cita').reset()
    } else {
      throw new Error(data.error || 'Error desconocido')
    }

  } catch (err) {
    feedback.className     = 'error'
    feedback.style.display = 'block'
    feedback.innerHTML =
      '❌ ' + err.message + '<br>' +
      '<small>Escríbenos por ' +
      '<a href="https://wa.me/593985574955" target="_blank" ' +
      'style="color:#ff6b6b">WhatsApp</a></small>'
  } finally {
    btn.textContent   = 'Enviar solicitud'
    btn.disabled      = false
    btn.style.opacity = '1'
  }

// ── Resize handler ──
window.addEventListener('resize', function() {
  var isMobile = window.innerWidth <= 768
  if (isMobile) {
    container.style.transform = 'translateY(-' + (currentSlide * 100) + 'vh)'
    container.style.flexDirection = 'column'
    container.style.width = '100vw'
    container.style.height = 'auto'
  } else {
    container.style.transform = 'translateX(-' + (currentSlide * 100) + 'vw)'
    container.style.flexDirection = 'row'
    container.style.width = '600vw'
    container.style.height = '100vh'
  }
})

}