(function () {
  var canvas = document.getElementById('three-canvas')
  if (!canvas) return

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setSize(innerWidth, innerHeight)
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.8

  var scene = new THREE.Scene()
  var camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 100)
  camera.position.set(0, 0, 7.5)

  // ── Luces ──
  scene.add(new THREE.AmbientLight(0xffffff, 0.15))
  var keyLight = new THREE.SpotLight(0xffffff, 14, 30, Math.PI/5, 0.4)
  keyLight.position.set(-5, 7, 8)
  scene.add(keyLight)
  var rimLight = new THREE.SpotLight(0x5BB8D4, 10, 25, Math.PI/4, 0.5)
  rimLight.position.set(4, -1, -5)
  scene.add(rimLight)
  var fillLight = new THREE.PointLight(0xffffff, 3, 20)
  fillLight.position.set(5, 2, 4)
  scene.add(fillLight)
  var glowLight = new THREE.PointLight(0x5BB8D4, 5, 15)
  glowLight.position.set(0, -4, 2)
  scene.add(glowLight)

  // ── Materiales DELGADOS ──
  var frameMat = new THREE.MeshPhysicalMaterial({
    color: 0x080808,
    metalness: 0.1,
    roughness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
  })
  var lensMat = new THREE.MeshPhysicalMaterial({
    color: 0x0d2018,
    metalness: 0.0,
    roughness: 0.0,
    transparent: true,
    opacity: 0.82,
  })
  var metalMat = new THREE.MeshPhysicalMaterial({
    color: 0xd0e0f0,
    metalness: 1.0,
    roughness: 0.04,
  })
  var rubberMat = new THREE.MeshPhysicalMaterial({
    color: 0x111111,
    metalness: 0.0,
    roughness: 0.9,
  })

  // ── Shape helpers ──
  function rShape(W, H, R) {
    var s = new THREE.Shape()
    s.moveTo(-W/2+R,-H/2); s.lineTo(W/2-R,-H/2)
    s.quadraticCurveTo(W/2,-H/2,W/2,-H/2+R)
    s.lineTo(W/2,H/2-R)
    s.quadraticCurveTo(W/2,H/2,W/2-R,H/2)
    s.lineTo(-W/2+R,H/2)
    s.quadraticCurveTo(-W/2,H/2,-W/2,H/2-R)
    s.lineTo(-W/2,-H/2+R)
    s.quadraticCurveTo(-W/2,-H/2,-W/2+R,-H/2)
    return s
  }
  function rPath(W, H, R) {
    var p = new THREE.Path()
    p.moveTo(-W/2+R,-H/2); p.lineTo(W/2-R,-H/2)
    p.quadraticCurveTo(W/2,-H/2,W/2,-H/2+R)
    p.lineTo(W/2,H/2-R)
    p.quadraticCurveTo(W/2,H/2,W/2-R,H/2)
    p.lineTo(-W/2+R,H/2)
    p.quadraticCurveTo(-W/2,H/2,-W/2,H/2-R)
    p.lineTo(-W/2,-H/2+R)
    p.quadraticCurveTo(-W/2,-H/2,-W/2+R,-H/2)
    return p
  }

  // ── Lente DELGADO ──
  function makeLens(W, H) {
    var g = new THREE.Group()
    var r = 0.18

    // Cristal fino
    var lGeo = new THREE.ExtrudeGeometry(rShape(W, H, r), {
      depth: 0.06, bevelEnabled: true,
      bevelSize: 0.018, bevelThickness: 0.018, bevelSegments: 6
    })
    lGeo.center()
    g.add(new THREE.Mesh(lGeo, lensMat))

    // Marco delgado
    var fShape = rShape(W+0.1, H+0.1, r+0.02)
    fShape.holes.push(rPath(W-0.02, H-0.02, r))
    var fGeo = new THREE.ExtrudeGeometry(fShape, {
      depth: 0.1, bevelEnabled: true,
      bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 6
    })
    fGeo.center()
    var frame = new THREE.Mesh(fGeo, frameMat)
    frame.position.z = 0.01
    g.add(frame)

    // Barra superior fina
    var tShape = new THREE.Shape()
    tShape.moveTo(-W/2+0.1,0); tShape.lineTo(W/2-0.1,0)
    tShape.lineTo(W/2-0.06,0.055); tShape.lineTo(-W/2+0.06,0.055)
    tShape.closePath()
    var tGeo = new THREE.ExtrudeGeometry(tShape, { depth: 0.12, bevelEnabled: false })
    tGeo.center()
    var topBar = new THREE.Mesh(tGeo, frameMat)
    topBar.position.set(0, H/2+0.08, 0.01)
    g.add(topBar)

    // Highlight sutil
    var hl = new THREE.Mesh(
      new THREE.PlaneGeometry(W*0.15, H*0.25),
      new THREE.MeshBasicMaterial({ color:0xffffff, transparent:true, opacity:0.04, side:THREE.DoubleSide })
    )
    hl.position.set(-W*0.2, H*0.1, 0.05)
    hl.rotation.z = 0.25
    g.add(hl)
    return g
  }

  // ── DEFINIR POSICIONES FINALES por slide ──
  // Cada slide tiene una configuración diferente de las gafas
  var slideConfigs = [
    // Slide 0: Hero — centrado, ligeramente a la derecha
    { px: 0.5, py: 0.0, rY: -0.08, rX: 0.04, scale: 1.0 },
    // Slide 1: Beneficios — derecha, inclinado
    { px: 2.2, py: 0.1, rY: -0.3, rX: 0.06, scale: 0.9 },
    // Slide 2: Servicios — esquina, pequeño
    { px: 3.5, py: 1.0, rY: -0.6, rX: 0.1, scale: 0.6 },
    // Slide 3: Productos — izquierda
    { px: -2.0, py: 0.0, rY: 0.3, rX: 0.04, scale: 0.85 },
    // Slide 4: Citas — abajo derecha
    { px: 1.5, py: -1.5, rY: -0.15, rX: 0.08, scale: 0.7 },
    // Slide 5: Ubicación — arriba izquierda
    { px: -2.5, py: 0.8, rY: 0.4, rX: 0.05, scale: 0.65 },
  ]

  // ── CREAR PIEZAS ──
  var pieces = []

  function createPiece(mesh, targetPos, startPos, startRotY) {
    scene.add(mesh)
    pieces.push({
      mesh: mesh,
      finalPos: targetPos.clone(),
      currentPos: startPos.clone(),
      startPos: startPos.clone(),
      finalRot: new THREE.Vector3(0, 0, 0),
      currentRot: new THREE.Vector3(0, startRotY || 0, 0),
      startRot: new THREE.Vector3(0, startRotY || 0, 0),
    })
    mesh.position.copy(startPos)
    mesh.rotation.set(0, startRotY || 0, 0)
  }

  // Lente izquierdo
  var leftLens = makeLens(1.52, 0.9)
  createPiece(leftLens,
    new THREE.Vector3(-1.08, 0, 0),
    new THREE.Vector3(-12, 5, -8),
    -Math.PI * 1.5
  )

  // Lente derecho
  var rightLens = makeLens(1.52, 0.9)
  createPiece(rightLens,
    new THREE.Vector3(1.08, 0, 0),
    new THREE.Vector3(12, -5, -8),
    Math.PI * 1.5
  )

  // Puente
  var bridgeGroup = new THREE.Group()
  ;[0.08, 0.0].forEach(function(y) {
    var b = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014,0.014,0.28,12), metalMat
    )
    b.rotation.z = Math.PI/2
    b.position.set(0, y+0.12, 0.04)
    bridgeGroup.add(b)
  })
  createPiece(bridgeGroup,
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 12, -6),
    0
  )

  // Almohadillas
  var padsGroup = new THREE.Group()
  ;[-0.09, 0.09].forEach(function(x) {
    var arm = new THREE.Mesh(new THREE.CylinderGeometry(0.008,0.008,0.12,8), metalMat)
    arm.rotation.x = Math.PI/2.6
    arm.position.set(x, 0.06, 0.09)
    padsGroup.add(arm)
    var pad = new THREE.Mesh(
      new THREE.SphereGeometry(0.028, 10, 10),
      new THREE.MeshPhysicalMaterial({ color:0xc0d8e8, roughness:0.2, transparent:true, opacity:0.7 })
    )
    pad.scale.set(1, 0.6, 0.5)
    pad.position.set(x, -0.01, 0.11)
    padsGroup.add(pad)
  })
  createPiece(padsGroup,
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, -12, -6),
    Math.PI
  )

  // Patilla izquierda
  var leftTemple = new THREE.Group()
  var lt = new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.012,0.55,10), rubberMat)
  lt.rotation.z = Math.PI/2
  lt.position.x = -(1.08 + 0.76 + 0.275)
  lt.position.y = 0.1
  lt.position.z = -0.03
  leftTemple.add(lt)
  var c1 = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0,0,0), new THREE.Vector3(0,-0.08,-0.05), new THREE.Vector3(0,-0.18,-0.15)
  )
  var tb1 = new THREE.Mesh(new THREE.TubeGeometry(c1,12,0.012,8,false), rubberMat)
  tb1.position.set(-(1.08+0.76+0.55), 0.1, -0.03)
  leftTemple.add(tb1)
  // bisagra izq
  var bh1 = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.09,0.12), frameMat)
  bh1.position.set(-(1.08+0.76), 0.11, 0.02)
  leftTemple.add(bh1)
  createPiece(leftTemple,
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-14, 3, -8),
    -Math.PI
  )

  // Patilla derecha
  var rightTemple = new THREE.Group()
  var rt = new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.012,0.55,10), rubberMat)
  rt.rotation.z = Math.PI/2
  rt.position.x = (1.08 + 0.76 + 0.275)
  rt.position.y = 0.1
  rt.position.z = -0.03
  rightTemple.add(rt)
  var c2 = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0,0,0), new THREE.Vector3(0,-0.08,-0.05), new THREE.Vector3(0,-0.18,-0.15)
  )
  var tb2 = new THREE.Mesh(new THREE.TubeGeometry(c2,12,0.012,8,false), rubberMat)
  tb2.position.set((1.08+0.76+0.55), 0.1, -0.03)
  rightTemple.add(tb2)
  var bh2 = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.09,0.12), frameMat)
  bh2.position.set((1.08+0.76), 0.11, 0.02)
  rightTemple.add(bh2)
  createPiece(rightTemple,
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(14, 3, -8),
    Math.PI
  )

  // ── Partículas ──
  var N = 80
  var ptPos = new Float32Array(N*3)
  var ptVel = []
  for (var i=0;i<N;i++) {
    ptPos[i*3]=(Math.random()-.5)*20
    ptPos[i*3+1]=(Math.random()-.5)*12
    ptPos[i*3+2]=(Math.random()-.5)*5-3
    ptVel.push({x:(Math.random()-.5)*.001,y:(Math.random()-.5)*.001})
  }
  var ptGeo = new THREE.BufferGeometry()
  ptGeo.setAttribute('position',new THREE.BufferAttribute(ptPos,3))
  scene.add(new THREE.Points(ptGeo,new THREE.PointsMaterial({
    color:0x5BB8D4,size:0.01,transparent:true,opacity:0.14
  })))

  // ── Estado global ──
  var mouseX = 0, mouseY = 0, t = 0
  var assemblyP = 0      // 0→1 entrada inicial
  var disassemblyP = 0   // 0→1 salida al cambiar slide
  var isDisassembling = false
  var isReassembling = false
  var currentSlideConfig = slideConfigs[0]
  var nextSlideConfig = slideConfigs[0]

  // Posición flotante suavizada del grupo completo
  var gPX = 0, gPY = 0, gRY = 0, gRX = 0.04, gSc = 1

  // Exponer función para que main.js llame al cambiar slide
  window.triggerGlassesTransition = function(slideIndex) {
    nextSlideConfig = slideConfigs[Math.min(slideIndex, slideConfigs.length-1)]
    if (assemblyP >= 1) {
      isDisassembling = true
      isReassembling = false
      disassemblyP = 0
    }
  }

  window.addEventListener('mousemove', function(e) {
    mouseX = (e.clientX/innerWidth-.5)*2
    mouseY = (e.clientY/innerHeight-.5)*2
  })
  window.addEventListener('resize', function() {
    camera.aspect = innerWidth/innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(innerWidth,innerHeight)
  })

  function lerp(a,b,t){ return a+(b-a)*t }
  function easeOut(t){ return 1-Math.pow(1-t,3) }
  function easeInOut(t){ return t<.5?4*t*t*t:(t-1)*(2*t-2)*(2*t-2)+1 }

  // Explotar: posiciones aleatorias lejos
  var explodedPositions = pieces.map(function(p, i) {
    return new THREE.Vector3(
      (Math.random()-.5)*20,
      (Math.random()-.5)*14,
      (Math.random()-.5)*8-4
    )
  })
  var explodedRots = pieces.map(function() {
    return new THREE.Vector3(
      (Math.random()-.5)*Math.PI*3,
      (Math.random()-.5)*Math.PI*3,
      (Math.random()-.5)*Math.PI*3
    )
  })

  function animate() {
    requestAnimationFrame(animate)
    t += 0.004

    // ── Fase 1: Assembly inicial ──
    if (assemblyP < 1) {
      assemblyP += 0.007
      pieces.forEach(function(p, idx) {
        var delay = idx * 0.1
        var lp = easeOut(Math.max(0, Math.min(1, (assemblyP - delay) / (1 - delay * 0.4))))
        p.mesh.position.x = lerp(p.startPos.x, p.finalPos.x, lp)
        p.mesh.position.y = lerp(p.startPos.y, p.finalPos.y, lp)
        p.mesh.position.z = lerp(p.startPos.z, p.finalPos.z, lp)
        p.mesh.rotation.x = lerp(p.startRot.x, 0, lp)
        p.mesh.rotation.y = lerp(p.startRot.y, 0, lp)
        p.mesh.rotation.z = lerp(p.startRot.z, 0, lp)
      })
    }

    // ── Fase 2: Desensamblar al cambiar slide ──
    if (isDisassembling) {
      disassemblyP += 0.025
      var dp = easeInOut(Math.min(disassemblyP, 1))
      pieces.forEach(function(p, idx) {
        p.mesh.position.x = lerp(p.finalPos.x + gPX, explodedPositions[idx].x, dp)
        p.mesh.position.y = lerp(p.finalPos.y + gPY, explodedPositions[idx].y, dp)
        p.mesh.position.z = lerp(p.finalPos.z, explodedPositions[idx].z, dp)
        p.mesh.rotation.x = lerp(0, explodedRots[idx].x, dp)
        p.mesh.rotation.y = lerp(gRY, explodedRots[idx].y, dp)
        p.mesh.rotation.z = lerp(0, explodedRots[idx].z, dp)
      })
      if (disassemblyP >= 1) {
        isDisassembling = false
        isReassembling = true
        disassemblyP = 0
        currentSlideConfig = nextSlideConfig
        // Regenerar posiciones de explosión para el reensamblo
        explodedPositions = pieces.map(function() {
          return new THREE.Vector3(
            (Math.random()-.5)*20,
            (Math.random()-.5)*14,
            (Math.random()-.5)*8-4
          )
        })
      }
    }

    // ── Fase 3: Reensamblar en nueva posición ──
    if (isReassembling) {
      disassemblyP += 0.012
      var rp = easeOut(Math.min(disassemblyP, 1))
      pieces.forEach(function(p, idx) {
        var delay = idx * 0.08
        var lrp = easeOut(Math.max(0, Math.min(1, (disassemblyP - delay) / (1 - delay*0.4))))
        p.mesh.position.x = lerp(explodedPositions[idx].x, p.finalPos.x + currentSlideConfig.px, lrp)
        p.mesh.position.y = lerp(explodedPositions[idx].y, p.finalPos.y + currentSlideConfig.py, lrp)
        p.mesh.position.z = lerp(explodedPositions[idx].z, p.finalPos.z, lrp)
        p.mesh.rotation.x = lerp(explodedRots[idx].x, 0, lrp)
        p.mesh.rotation.y = lerp(explodedRots[idx].y, currentSlideConfig.rY, lrp)
        p.mesh.rotation.z = lerp(explodedRots[idx].z, 0, lrp)
      })
      if (disassemblyP >= 1) {
        isReassembling = false
        gPX = currentSlideConfig.px
        gPY = currentSlideConfig.py
        gRY = currentSlideConfig.rY
        gRX = currentSlideConfig.rX
        gSc = currentSlideConfig.scale
      }
    }

    // ── Flotar suave cuando está ensamblado ──
    if (!isDisassembling && !isReassembling && assemblyP >= 1) {
      var tPX = currentSlideConfig.px + mouseX * 0.08 + Math.sin(t*.35)*.04
      var tPY = currentSlideConfig.py + mouseY * 0.06 + Math.cos(t*.28)*.03
      var tRY = currentSlideConfig.rY + mouseX * 0.08 + Math.sin(t*.25)*.02
      var tRX = currentSlideConfig.rX + mouseY * 0.04
      var tSc = currentSlideConfig.scale

      gPX = lerp(gPX, tPX, 0.05)
      gPY = lerp(gPY, tPY, 0.05)
      gRY = lerp(gRY, tRY, 0.06)
      gRX = lerp(gRX, tRX, 0.05)
      gSc = lerp(gSc, tSc, 0.04)

      pieces.forEach(function(p) {
        p.mesh.position.x = p.finalPos.x + gPX
        p.mesh.position.y = p.finalPos.y + gPY
        p.mesh.rotation.y = gRY
        p.mesh.rotation.x = gRX + Math.sin(t*.18)*.005
        p.mesh.rotation.z = Math.sin(t*.22)*.006
      })

      // Escala global via camera
      camera.position.z = lerp(camera.position.z, 7.5 / gSc, 0.04)
    }

    // Luces
    keyLight.intensity = 14 + Math.sin(t*.6)*2
    rimLight.intensity = 10 + Math.sin(t*.8)*1.5
    glowLight.intensity = 5 + Math.sin(t*1.0)*1
    glowLight.position.set(Math.sin(t*.4)*1.5, -4, 2)

    // Partículas
    for (var i=0;i<N;i++) {
      ptPos[i*3]+=ptVel[i].x; ptPos[i*3+1]+=ptVel[i].y
      if(Math.abs(ptPos[i*3])>10)ptVel[i].x*=-1
      if(Math.abs(ptPos[i*3+1])>6)ptVel[i].y*=-1
    }
    ptGeo.attributes.position.needsUpdate=true
    renderer.render(scene,camera)
  }
  animate()
})()