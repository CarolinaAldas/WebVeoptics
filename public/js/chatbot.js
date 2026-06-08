var chatOpen = false
var chatHistory = []

var SYSTEM_PROMPT = 'Eres la asistente virtual de VeoOptics, un consultorio de optometría ubicado en Pío Bravo 2-15 y Manuel Vega, Cuenca, Ecuador.\n\nTu personalidad: amable, profesional, concisa. Máximo 3 párrafos cortos.\n\nServicios: Examen visual completo, Lentes oftálmicos, Lentes de contacto, Optometría pediátrica, Terapia visual, Control de miopía.\n\nHorario: Lunes a Viernes 9:00-18:00, Sábados 9:00-13:00.\n\nPara agendar citas: pide nombre y servicio, luego indícales que completen el formulario en la página o escriban por WhatsApp.\n\nResponde SIEMPRE en español.'

function toggleChat() {
  chatOpen = !chatOpen
  document.getElementById('chat-window')
    .classList.toggle('open', chatOpen)
  if (chatOpen) {
    setTimeout(() => {
      document.getElementById('chat-input').focus()
    }, 350)
  }
}

function quickSend(text) {
  document.getElementById('chat-input').value = text
  sendChat()
}

function getTime() {
  return new Date().toLocaleTimeString('es-EC', {
    hour: '2-digit', minute: '2-digit'
  })
}

function appendMsg(text, role) {
  var msgs = document.getElementById('chat-messages')
  var div  = document.createElement('div')
  div.className = 'msg ' + role
  div.innerHTML = text.replace(/\n/g, '<br>') +
    '<span class="msg-time">' + getTime() + '</span>'
  msgs.appendChild(div)
  msgs.scrollTop = msgs.scrollHeight
}

function showTyping() {
  var msgs = document.getElementById('chat-messages')
  var div  = document.createElement('div')
  div.className = 'typing'
  div.id = 'typing-indicator'
  div.innerHTML = '<span></span><span></span><span></span>'
  msgs.appendChild(div)
  msgs.scrollTop = msgs.scrollHeight
}

function hideTyping() {
  var el = document.getElementById('typing-indicator')
  if (el) el.remove()
}

async function sendChat() {
  var input = document.getElementById('chat-input')
  var text  = input.value.trim()
  if (!text) return

  input.value = ''
  appendMsg(text, 'user')
  chatHistory.push({ role: 'user', content: text })
  showTyping()

  try {
    var response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: chatHistory
      })
    })

    var data  = await response.json()
    hideTyping()

    var reply = (data && data.content && data.content[0])
      ? data.content[0].text
      : 'Lo siento, hubo un error. Intenta de nuevo.'

    appendMsg(reply, 'bot')
    chatHistory.push({ role: 'assistant', content: reply })

    // Si menciona cita, mostrar link al slide
    var keywords = ['cita', 'agendar', 'reservar', 'formulario']
    var mentionsCita = keywords.some(function(k) {
      return reply.toLowerCase().includes(k)
    })
    if (mentionsCita && chatHistory.length < 8) {
      setTimeout(function() {
        appendMsg(
          '👉 <a href="#" onclick="goTo(4);toggleChat();return false;" ' +
          'style="color:var(--blue)">Ir al formulario de citas →</a>',
          'bot'
        )
      }, 600)
    }

  } catch (err) {
    hideTyping()
    appendMsg(
      'No pude conectarme. Escríbenos por ' +
      '<a href="https://wa.me/" target="_blank" ' +
      'style="color:var(--blue)">WhatsApp</a>.',
      'bot'
    )
  }
}