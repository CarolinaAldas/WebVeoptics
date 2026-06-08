(function () {

  const canvas = document.getElementById('three-canvas')
  if (!canvas) return

  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: true, alpha: true
  })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setSize(innerWidth, innerHeight)
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.8
  renderer.outputEncoding = THREE.sRGBEncoding

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    38, innerWidth / innerHeight, 0.1, 100
  )
  camera.position.set(0, 0, 7.5)

  // ── HDR environment ──
  if (typeof THREE.RGBELoader !== 'undefined') {
    new THREE.RGBELoader()
      .setPath('/assets/')
      .load('studio_small_08_1k.hdr', tex => {
        tex.mapping = THREE.EquirectangularReflectionMapping
        scene.environment = tex
      })
  }

  // ── Luces ──
  scene.add(new THREE.AmbientLight(0xffffff, 0.1))

  const key = new THREE.SpotLight(0xffffff, 14, 30, Math.PI/5, 0.4)
  key.position.set(-5, 7, 8)
  scene.add(key)

  const rim = new THREE.SpotLight(0x5BB8D4, 10, 25, Math.PI/4, 0.5)
  rim.position.set(4, -1, -5)
  scene.add(rim)

  const fill = new THREE.PointLight(0xffffff, 3, 20)
  fill.position.set(5, 2, 4)
  scene.add(fill)

  const glow = new THREE.PointLight(0x5BB8D4, 5, 15)
  glow.position.set(0, -4, 2)
  scene.add(glow)

  // ── Materiales ──
  const frameMat = new THREE.MeshPhysicalMaterial({
    color: 0x060606,
    metalness: 0.0,
    roughness: 0.03,
    clearcoat: 1.0,
    clearcoatRoughness: 0.01,
    envMapIntensity: 2.0,
  })

  const lensMat = new THREE.MeshPhysicalMaterial({
    color: 0x0d1f18,
    metalness: 0.0,
    roughness: 0.0,
    transmission: 0.55,
    thickness: 2.5,
    transparent: true,
    opacity: 0.92,
    ior: 1.523,
    envMapIntensity: 3.0,
  })

  const metalMat = new THREE.MeshPhysicalMaterial({
    color: 0xc0d0e0,
    metalness: 1.0,
    roughness: 0.05,
    envMapIntensity: 3.5,
  })

  const goldMat = new THREE.MeshPhysicalMaterial({
    color: 0xc8a840,
    metalness: 1.0,
    roughness: 0.06,
  })

  const rubberMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a0a0a,
    metalness: 0.0,
    roughness: 0.95,
  })

  // ── Shape helpers ──
  function rShape(W, H, R) {
    const s = new THREE.Shape()
    s.moveTo(-W/2+R, -H/2)
    s.lineTo( W/2-R, -H/2)
    s.quadraticCurveTo( W/2,-H/2, W/2,-H/2+R)
    s.lineTo( W/2, H/2-R)
    s.quadraticCurveTo( W/2, H/2, W/2-R, H/2)
    s.lineTo(-W/2+R, H/2)
    s.quadraticCurveTo(-W/2, H/2,-W/2, H/2-R)
    s.lineTo(-W/2,-H/2+R)
    s.quadraticCurveTo(-W/2,-H/2,-W/2+R,-H/2)
    return s
  }

  function rPath(W, H, R) {
    const p = new THREE.Path()
    p.moveTo(-W/2+R, -H/2)
    p.lineTo( W/2-R, -H/2)
    p.quadraticCurveTo( W/2,-H/2, W/2,-H/2+R)
    p.lineTo( W/2, H/2-R)
    p.quadraticCurveTo( W/2, H/2, W/2-R, H/2)
    p.lineTo(-W/2+R, H/2)
    p.quadraticCurveTo(-W/2, H/2,-W/2, H/2-R)
    p.lineTo(-W/2,-H/2+R)
    p.quadraticCurveTo(-W/2,-H/2,-W/2+R,-H/2)
    return p
  }

  // ── Lente Wayfarer ──
  function makeLens(W, H, tx) {
    const g = new THREE.Group()
    const r = 0.2

    // Cristal
    const lGeo = new THREE.ExtrudeGeometry(rShape(W,H,r), {
      depth: 0.18, bevelEnabled: true,
      bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 12
    })
    lGeo.center()
    g.add(new THREE.Mesh(lGeo, lensMat))

    // Marco
    const fShape = rShape(W+0.2, H+0.18, r+0.04)
    fShape.holes.push(rPath(W, H, r))
    const fGeo = new THREE.ExtrudeGeometry(fShape, {
      depth: 0.3, bevelEnabled: true,
      bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 10
    })
    fGeo.center()
    const frame = new THREE.Mesh(fGeo, frameMat)
    frame.position.z = 0.02
    g.add(frame)

    // Barra superior Wayfarer
    const tShape = new THREE.Shape()
    tShape.moveTo(-W/2+0.08, 0)
    tShape.lineTo( W/2-0.08, 0)
    tShape.lineTo( W/2-0.04, 0.1)
    tShape.lineTo(-W/2+0.04, 0.1)
    tShape.closePath()
    const tGeo = new THREE.ExtrudeGeometry(tShape, {
      depth: 0.32, bevelEnabled: false
    })
    tGeo.center()
    const topBar = new THREE.Mesh(tGeo, frameMat)
    topBar.position.set(0, H/2+0.14, 0.025)
    g.add(topBar)

    // Highlight cristal
    g.add(Object.assign(
      new THREE.Mesh(
        new THREE.PlaneGeometry(W*0.18, H*0.28),
        new THREE.MeshBasicMaterial({
          color:0xffffff, transparent:true, opacity:0.045,
          side: THREE.DoubleSide
        })
      ),
      { position: new THREE.Vector3(-W*0.22, H*0.1, 0.12),
        rotation: new THREE.Euler(0,0,0.28) }
    ))

    g.position.x = tx
    return g
  }

  // ── Armar gafas ──
  const glasses = new THREE.Group()
  glasses.add(makeLens(1.58, 0.96, -1.1))
  glasses.add(makeLens(1.58, 0.96,  1.1))

  // Puente doble
  ;[0.09, 0.0].forEach(y => {
    const b = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018,0.018,0.3,12), metalMat
    )
    b.rotation.z = Math.PI/2
    b.position.set(0, y+0.13, 0.06)
    glasses.add(b)
  })

  // Placa puente
  const bp = new THREE.Mesh(
    new THREE.BoxGeometry(0.34,0.08,0.08), frameMat
  )
  bp.position.set(0, 0.18, 0.07)
  glasses.add(bp)

  // Almohadillas
  ;[-0.1, 0.1].forEach(x => {
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.009,0.009,0.15,8), metalMat
    )
    arm.rotation.x = Math.PI/2.6
    arm.position.set(x, 0.07, 0.1)
    glasses.add(arm)

    const pad = new THREE.Mesh(
      new THREE.SphereGeometry(0.034,12,12),
      new THREE.MeshPhysicalMaterial({
        color:0xc0d8e8, roughness:0.15,
        transparent:true, opacity:0.72
      })
    )
    pad.scale.set(1, 0.6, 0.5)
    pad.position.set(x, -0.01, 0.13)
    glasses.add(pad)
  })

  // Bisagras y patillas
  ;[{x:-1.86,s:-1},{x:1.86,s:1}].forEach(({x,s}) => {
    // Caja bisagra
    const hb = new THREE.Mesh(
      new THREE.BoxGeometry(0.13,0.11,0.34), frameMat
    )
    hb.position.set(x+s*0.02, 0.13, 0.04)
    glasses.add(hb)

    // Placa metal
    const hp = new THREE.Mesh(
      new THREE.BoxGeometry(0.07,0.08,0.12), metalMat
    )
    hp.position.set(x+s*0.07, 0.13, 0.04)
    glasses.add(hp)

    // Tornillos
    ;[-0.04,0.04].forEach(dz => {
      const sc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.013,0.013,0.09,8), goldMat
      )
      sc.position.set(x+s*0.07, 0.13, dz)
      glasses.add(sc)
    })

    // Patilla
    const t = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026,0.016,0.62,12), rubberMat
    )
    t.rotation.z = Math.PI/2
    t.position.set(x+s*0.31, 0.12, -0.04)
    glasses.add(t)

    // Curva oreja
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0,0,0),
      new THREE.Vector3(0,-0.1,-0.06),
      new THREE.Vector3(0,-0.22,-0.18)
    )
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve,14,0.015,8,false), rubberMat
    )
    tube.position.set(x+s*0.62, 0.12, -0.04)
    glasses.add(tube)
  })

  glasses.position.set(0.5, 0, 0)
  glasses.rotation.set(0.05, -0.1, 0.015)
  scene.add(glasses)

  // ── Partículas ──
  const N = 100
  const ptPos = new Float32Array(N*3)
  const ptVel = []
  for (let i=0;i<N;i++) {
    ptPos[i*3]   = (Math.random()-.5)*20
    ptPos[i*3+1] = (Math.random()-.5)*12
    ptPos[i*3+2] = (Math.random()-.5)*5-3
    ptVel.push({
      x:(Math.random()-.5)*.0008,
      y:(Math.random()-.5)*.0008
    })
  }
  const ptGeo = new THREE.BufferGeometry()
  ptGeo.setAttribute('position', new THREE.BufferAttribute(ptPos,3))
  scene.add(new THREE.Points(ptGeo, new THREE.PointsMaterial({
    color:0x5BB8D4, size:0.011, transparent:true, opacity:0.15
  })))

  // ── Estado ──
  var mouseX=0, mouseY=0, t=0
  var sPX=0.5, sPY=0, sRY=-0.1, sRX=0.05

  window.addEventListener('mousemove', e => {
    mouseX = (e.clientX/innerWidth -.5)*2
    mouseY = (e.clientY/innerHeight-.5)*2
  })
  window.addEventListener('resize', () => {
    camera.aspect = innerWidth/innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(innerWidth, innerHeight)
  })

  function lerp(a,b,t){ return a+(b-a)*t }

  function animate() {
    requestAnimationFrame(animate)
    t += 0.003

    var tPX = 0.5 + mouseX*0.1  + Math.sin(t*.35)*.05
    var tPY = mouseY*0.07 + Math.cos(t*.28)*.03
    var tRY = -0.1 + mouseX*0.1 + Math.sin(t*.25)*.025
    var tRX = 0.05 + mouseY*0.05

    sPX = lerp(sPX, tPX, 0.055)
    sPY = lerp(sPY, tPY, 0.055)
    sRY = lerp(sRY, tRY, 0.065)
    sRX = lerp(sRX, tRX, 0.055)

    glasses.position.set(sPX, sPY, 0)
    glasses.rotation.y = sRY
    glasses.rotation.x = sRX
    glasses.rotation.z = Math.sin(t*.18)*.006

    key.intensity  = 14 + Math.sin(t*.6)*2
    rim.intensity  = 10 + Math.sin(t*.8)*1.5
    glow.intensity =  5 + Math.sin(t*1.0)*1
    glow.position.set(Math.sin(t*.4)*1.5, -4, 2)

    for (var i=0;i<N;i++) {
      ptPos[i*3]   += ptVel[i].x
      ptPos[i*3+1] += ptVel[i].y
      if (Math.abs(ptPos[i*3])  >10) ptVel[i].x*=-1
      if (Math.abs(ptPos[i*3+1])>6)  ptVel[i].y*=-1
    }
    ptGeo.attributes.position.needsUpdate = true
    renderer.render(scene, camera)
  }
  animate()
})()