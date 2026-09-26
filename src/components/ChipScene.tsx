import { useEffect, useRef } from "react"
import * as THREE from "three"
import { usePreferences } from "@/context/preferences"
import type { Palette } from "@/lib/content"
import { cn } from "@/lib/utils"

const CHIP = 2.2 // die package width
const PINS_PER_SIDE = 7
const PIN_GAP = 0.28
const TRAIL = 22
const TRAIL_STEP = 0.06

type SceneApi = { setColors: (palette: Palette, dark: boolean) => void }

/** Soft radial dot used for glows. */
function glowTexture() {
  const size = 128
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = size
  const ctx = canvas.getContext("2d")!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, "rgba(255,255,255,1)")
  g.addColorStop(0.25, "rgba(255,255,255,0.45)")
  g.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** Grid of "cores" drawn in white; tinted by the material's emissive color. */
function coreTexture() {
  const size = 256
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = size
  const ctx = canvas.getContext("2d")!
  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, size, size)
  const n = 6
  const pad = 22
  const cell = (size - pad * 2) / n
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const v = 0.35 + Math.random() * 0.65
      ctx.fillStyle = `rgba(255,255,255,${v})`
      ctx.beginPath()
      ctx.roundRect(pad + x * cell + 4, pad + y * cell + 4, cell - 8, cell - 8, 4)
      ctx.fill()
    }
  }
  ctx.strokeStyle = "rgba(255,255,255,0.8)"
  ctx.lineWidth = 3
  ctx.strokeRect(pad - 8, pad - 8, size - (pad - 8) * 2, size - (pad - 8) * 2)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** A polyline on the board with arc-length lookup. */
class Trace {
  points: THREE.Vector3[]
  lengths: number[] = [0]
  total = 0
  constructor(points: THREE.Vector3[]) {
    this.points = points
    for (let i = 1; i < points.length; i++) {
      this.total += points[i].distanceTo(points[i - 1])
      this.lengths.push(this.total)
    }
  }
  at(s: number, out: THREE.Vector3) {
    const d = Math.min(Math.max(s, 0), this.total)
    let i = 1
    while (i < this.lengths.length - 1 && this.lengths[i] < d) i++
    const a = this.lengths[i - 1]
    const k = (d - a) / (this.lengths[i] - a || 1)
    return out.lerpVectors(this.points[i - 1], this.points[i], k)
  }
}

/** Fan of traces leaving each side of the chip, bending 45° away from the centre. */
function buildTraces() {
  const traces: Trace[] = []
  const half = CHIP / 2
  const sides = [
    { n: new THREE.Vector3(1, 0, 0), t: new THREE.Vector3(0, 0, 1) },
    { n: new THREE.Vector3(-1, 0, 0), t: new THREE.Vector3(0, 0, -1) },
    { n: new THREE.Vector3(0, 0, 1), t: new THREE.Vector3(-1, 0, 0) },
    { n: new THREE.Vector3(0, 0, -1), t: new THREE.Vector3(1, 0, 0) },
  ]
  for (const { n, t } of sides) {
    for (let i = 0; i < PINS_PER_SIDE; i++) {
      const offset = (i - (PINS_PER_SIDE - 1) / 2) * PIN_GAP
      const p0 = n.clone().multiplyScalar(half + 0.22).addScaledVector(t, offset)
      const p1 = p0.clone().addScaledVector(n, 0.25 + Math.random() * 0.35)
      // bend sideways proportionally to the pin offset so the fan never crosses
      const bend = Math.abs(offset) * 1.1
      const p2 = p1.clone().addScaledVector(n, bend).addScaledVector(t, Math.sign(offset) * bend)
      const p3 = p2.clone().addScaledVector(n, 0.4 + Math.random() * 0.9)
      traces.push(new Trace([p0, p1, p2, p3]))
    }
  }
  return traces
}

const trailVertex = /* glsl */ `
  attribute float alpha;
  uniform float uPixelRatio;
  uniform float uScale;
  varying float vAlpha;
  void main() {
    vAlpha = alpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = mix(1.5, 13.0, alpha) * uPixelRatio * uScale * (10.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`
const trailFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor, soft * vAlpha * uOpacity);
  }
`

export default function ChipScene({ className }: { className?: string }) {
  const { palette, dark } = usePreferences()
  const mountRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<SceneApi | null>(null)
  const colorsRef = useRef({ palette, dark })

  useEffect(() => {
    colorsRef.current = { palette, dark }
    apiRef.current?.setColors(palette, dark)
  }, [palette, dark])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    const pixelRatio = Math.min(window.devicePixelRatio, 2)
    renderer.setPixelRatio(pixelRatio)
    renderer.domElement.style.display = "block"
    renderer.domElement.style.width = "100%"
    renderer.domElement.style.height = "100%"
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
    // tilt: look down onto the board; spinner rotates around the board's normal
    const tiltGroup = new THREE.Group()
    tiltGroup.rotation.x = 0.95
    scene.add(tiltGroup)
    const board = new THREE.Group()
    tiltGroup.add(board)

    const disposables: { dispose: () => void }[] = []
    const track = <T extends { dispose: () => void }>(o: T) => (disposables.push(o), o)
    const glow = track(glowTexture())

    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(3, 6, 5)
    scene.add(key)
    const rim = new THREE.PointLight(0xffffff, 18, 20)
    rim.position.set(-4, 2, -3)
    scene.add(rim)

    // Chip package + glowing die
    const chip = new THREE.Group()
    board.add(chip)
    const bodyMat = track(new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.55 }))
    const body = new THREE.Mesh(track(new THREE.BoxGeometry(CHIP, 0.32, CHIP)), bodyMat)
    body.position.y = 0.16
    chip.add(body)
    const coreTex = track(coreTexture())
    const dieMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        emissiveMap: coreTex,
        roughness: 0.4,
        metalness: 0.2,
      }),
    )
    const die = new THREE.Mesh(track(new THREE.PlaneGeometry(CHIP * 0.72, CHIP * 0.72)), dieMat)
    die.rotation.x = -Math.PI / 2
    die.position.y = 0.325
    chip.add(die)
    const dieGlowMat = track(
      new THREE.SpriteMaterial({ map: glow, transparent: true, depthWrite: false }),
    )
    const dieGlow = new THREE.Sprite(dieGlowMat)
    dieGlow.position.y = 0.4
    dieGlow.scale.setScalar(3.4)
    chip.add(dieGlow)

    // Pins (instanced)
    const traces = buildTraces()
    const pinMat = track(new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0.9 }))
    const pins = new THREE.InstancedMesh(
      track(new THREE.BoxGeometry(0.1, 0.06, 0.34)),
      pinMat,
      traces.length,
    )
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const up = new THREE.Vector3(0, 1, 0)
    traces.forEach((tr, i) => {
      const [p0, p1] = tr.points
      const dir = p1.clone().sub(p0).normalize()
      q.setFromAxisAngle(up, Math.atan2(dir.x, dir.z))
      const pos = p0.clone().addScaledVector(dir, -0.12)
      pos.y = 0.08
      m.compose(pos, q, new THREE.Vector3(1, 1, 1))
      pins.setMatrixAt(i, m)
    })
    board.add(pins)

    // Traces (one merged line geometry) + solder pads
    const segs: number[] = []
    for (const tr of traces) {
      for (let i = 1; i < tr.points.length; i++) {
        const a = tr.points[i - 1]
        const b = tr.points[i]
        segs.push(a.x, 0, a.z, b.x, 0, b.z)
      }
    }
    const traceGeo = track(new THREE.BufferGeometry())
    traceGeo.setAttribute("position", new THREE.Float32BufferAttribute(segs, 3))
    const traceMat = track(new THREE.LineBasicMaterial({ transparent: true, depthWrite: false }))
    board.add(new THREE.LineSegments(traceGeo, traceMat))

    const padMat = track(new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide }))
    const pads = new THREE.InstancedMesh(
      track(new THREE.RingGeometry(0.05, 0.1, 20)),
      padMat,
      traces.length,
    )
    const flat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2)
    traces.forEach((tr, i) => {
      const end = tr.points[tr.points.length - 1]
      m.compose(new THREE.Vector3(end.x, 0.005, end.z), flat, new THREE.Vector3(1, 1, 1))
      pads.setMatrixAt(i, m)
    })
    board.add(pads)

    // Data packets: one merged point cloud, TRAIL samples per trace
    const pulses = traces.map(() => ({
      speed: 0.9 + Math.random() * 1.4,
      phase: Math.random() * 10,
      inbound: Math.random() < 0.5,
    }))
    const pulsePos = new Float32Array(traces.length * TRAIL * 3)
    const pulseAlpha = new Float32Array(traces.length * TRAIL)
    const pulseGeo = track(new THREE.BufferGeometry())
    pulseGeo.setAttribute("position", new THREE.BufferAttribute(pulsePos, 3))
    pulseGeo.setAttribute("alpha", new THREE.BufferAttribute(pulseAlpha, 1))
    const pulseMat = track(
      new THREE.ShaderMaterial({
        vertexShader: trailVertex,
        fragmentShader: trailFragment,
        uniforms: {
          uColor: { value: new THREE.Color() },
          uOpacity: { value: 1 },
          uPixelRatio: { value: pixelRatio },
          uScale: { value: 1 },
        },
        transparent: true,
        depthWrite: false,
      }),
    )
    const pulseCloud = new THREE.Points(pulseGeo, pulseMat)
    pulseCloud.frustumCulled = false
    board.add(pulseCloud)

    // Background dust
    const DUST = 220
    const dustPos = new Float32Array(DUST * 3)
    for (let i = 0; i < DUST; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(5.5 + Math.random() * 4)
      dustPos.set([v.x, v.y, v.z], i * 3)
    }
    const dustGeo = track(new THREE.BufferGeometry())
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3))
    const dustMat = track(
      new THREE.PointsMaterial({ size: 0.06, transparent: true, depthWrite: false, map: glow }),
    )
    const dust = new THREE.Points(dustGeo, dustMat)
    scene.add(dust)

    const setColors = (p: Palette, isDark: boolean) => {
      const blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending
      bodyMat.color.set(isDark ? "#1e293b" : "#334155")
      dieMat.emissive.set(p[400])
      pinMat.color.set(isDark ? "#cbd5e1" : "#94a3b8")
      rim.color.set(p[400])
      dieGlowMat.color.set(p[400])
      dieGlowMat.opacity = isDark ? 0.5 : 0.3
      dieGlowMat.blending = blending
      traceMat.color.set(isDark ? p[400] : p[600])
      traceMat.opacity = isDark ? 0.35 : 0.5
      padMat.color.set(isDark ? p[400] : p[600])
      padMat.opacity = isDark ? 0.6 : 0.7
      pulseMat.uniforms.uColor.value.set(isDark ? p[400] : p[600])
      pulseMat.uniforms.uOpacity.value = isDark ? 1 : 0.85
      pulseMat.blending = blending
      dustMat.color.set(isDark ? p[400] : p[600])
      dustMat.opacity = isDark ? 0.5 : 0.3
      for (const mat of [dieGlowMat, pulseMat, dustMat, traceMat, padMat]) mat.needsUpdate = true
    }
    setColors(colorsRef.current.palette, colorsRef.current.dark)
    apiRef.current = { setColors }

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect()
      if (!width || !height) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      // at icon size frame just the chip; otherwise the whole board
      const compact = height < 160
      const base = compact ? 6.2 : 12.5
      const fit = camera.aspect < 1 ? base / camera.aspect : base
      camera.position.set(0, 0, fit)
      camera.updateProjectionMatrix()
      // point trails are sized in pixels, so shrink them with the canvas
      pulseMat.uniforms.uScale.value = Math.min(1.2, Math.max(0.15, height / 480))
      // at icon size the dust and pads are just noise
      dust.visible = !compact
      pads.visible = !compact
    }
    const ro = new ResizeObserver(resize)
    ro.observe(mount)
    resize()

    // Interaction: tilt toward the pointer, drag to spin, click to overclock
    const tilt = { x: 0, y: 0 }
    let spin = 0
    let boost = 0
    let dragging = false
    let dragMoved = 0
    let lastX = 0
    const onPointerMove = (e: PointerEvent) => {
      const r = mount.getBoundingClientRect()
      tilt.x = ((e.clientY - r.top) / r.height - 0.5) * 0.4
      tilt.y = ((e.clientX - r.left) / r.width - 0.5) * 0.5
      if (dragging) {
        const dx = e.clientX - lastX
        dragMoved += Math.abs(dx)
        spin += dx * 0.0025
        lastX = e.clientX
      }
    }
    const onPointerDown = (e: PointerEvent) => {
      dragging = true
      dragMoved = 0
      lastX = e.clientX
      mount.setPointerCapture(e.pointerId)
    }
    const onPointerUp = (e: PointerEvent) => {
      if (dragging && dragMoved < 6) boost = 1
      dragging = false
      if (mount.hasPointerCapture(e.pointerId)) mount.releasePointerCapture(e.pointerId)
    }
    window.addEventListener("pointermove", onPointerMove)
    mount.addEventListener("pointerdown", onPointerDown)
    mount.addEventListener("pointerup", onPointerUp)
    mount.addEventListener("pointercancel", onPointerUp)

    const tmp = new THREE.Vector3()
    const motion = reducedMotion ? 0.15 : 1
    let last = performance.now()
    let t = 0
    let elapsed = 0

    const frame = () => {
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      elapsed += dt * motion
      boost = Math.max(0, boost - dt * 0.7)
      t += dt * motion * (1 + boost * 4)

      spin *= 0.94
      board.rotation.y += dt * motion * 0.18 + spin
      tiltGroup.rotation.x += (0.95 + tilt.x - tiltGroup.rotation.x) * 0.05
      tiltGroup.rotation.z += (-tilt.y * 0.4 - tiltGroup.rotation.z) * 0.05
      tiltGroup.position.y = Math.sin(elapsed * 1.2) * 0.12

      const pulse = 0.55 + Math.sin(elapsed * 2.4) * 0.15 + boost * 1.2
      dieMat.emissiveIntensity = pulse
      dieGlow.scale.setScalar(3.4 * (1 + boost * 0.6) + Math.sin(elapsed * 2.4) * 0.12)

      traces.forEach((tr, ti) => {
        const p = pulses[ti]
        const cycle = tr.total + 1.2 // a short pause between packets
        const s = (p.phase + t * p.speed) % cycle
        for (let i = 0; i < TRAIL; i++) {
          const along = s - i * TRAIL_STEP
          const k = (ti * TRAIL + i) * 3
          const visible = along >= 0 && along <= tr.total
          tr.at(p.inbound ? tr.total - along : along, tmp)
          pulsePos[k] = tmp.x
          pulsePos[k + 1] = 0.02
          pulsePos[k + 2] = tmp.z
          pulseAlpha[ti * TRAIL + i] = visible ? Math.pow(1 - i / TRAIL, 1.5) : 0
        }
      })
      pulseGeo.attributes.position.needsUpdate = true
      pulseGeo.attributes.alpha.needsUpdate = true

      dust.rotation.y -= dt * motion * 0.03
      renderer.render(scene, camera)
    }

    let onScreen = true
    const updateLoop = () => {
      const run = onScreen && document.visibilityState === "visible"
      if (run) last = performance.now()
      renderer.setAnimationLoop(run ? frame : null)
    }
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      updateLoop()
    })
    io.observe(mount)
    document.addEventListener("visibilitychange", updateLoop)
    updateLoop()

    return () => {
      renderer.setAnimationLoop(null)
      io.disconnect()
      ro.disconnect()
      document.removeEventListener("visibilitychange", updateLoop)
      window.removeEventListener("pointermove", onPointerMove)
      mount.removeEventListener("pointerdown", onPointerDown)
      mount.removeEventListener("pointerup", onPointerUp)
      mount.removeEventListener("pointercancel", onPointerUp)
      pins.dispose()
      pads.dispose()
      for (const d of disposables) d.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
      apiRef.current = null
    }
  }, [])

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className={cn("cursor-grab touch-none select-none active:cursor-grabbing", className)}
    />
  )
}
