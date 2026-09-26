import { useEffect, useRef } from "react"
import * as THREE from "three"
import { usePreferences } from "@/context/preferences"
import type { Palette } from "@/lib/content"

const TRAIL = 90
const ORBITS = [
  { rz: 0, speed: 1.0, phase: 0 },
  { rz: Math.PI / 3, speed: 0.82, phase: 2.1 },
  { rz: (2 * Math.PI) / 3, speed: 1.18, phase: 4.2 },
]
const RX = 3.1
const RY = 1.15

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

/** Point on the orbit ellipse (orbit-local XY plane). */
function ellipse(t: number, out: THREE.Vector3) {
  return out.set(Math.cos(t) * RX, Math.sin(t) * RY, 0)
}

/** Evenly spread points on a sphere, used to pack the nucleus. */
function fibonacci(i: number, n: number, r: number) {
  const y = 1 - (i / (n - 1)) * 2
  const radius = Math.sqrt(1 - y * y)
  const theta = Math.PI * (3 - Math.sqrt(5)) * i
  return new THREE.Vector3(Math.cos(theta) * radius * r, y * r, Math.sin(theta) * radius * r)
}

const trailVertex = /* glsl */ `
  attribute float alpha;
  uniform float uPixelRatio;
  uniform float uScale;
  varying float vAlpha;
  void main() {
    vAlpha = alpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = mix(2.0, 15.0, alpha) * uPixelRatio * uScale * (8.0 / -mv.z);
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

export default function AtomScene() {
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
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    const atom = new THREE.Group()
    atom.rotation.x = 0.35
    scene.add(atom)

    const disposables: { dispose: () => void }[] = []
    const track = <T extends { dispose: () => void }>(o: T) => (disposables.push(o), o)
    const glow = track(glowTexture())

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.55))
    const key = new THREE.PointLight(0xffffff, 40, 30)
    key.position.set(4, 5, 6)
    scene.add(key)
    const rim = new THREE.PointLight(0xffffff, 25, 30)
    rim.position.set(-5, -3, -4)
    scene.add(rim)

    // Nucleus: protons + neutrons packed on two shells
    const nucleus = new THREE.Group()
    atom.add(nucleus)
    const nucleonGeo = track(new THREE.SphereGeometry(0.27, 32, 32))
    const protonMat = track(new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.15 }))
    const neutronMat = track(new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.05 }))
    const nucleons: { mesh: THREE.Mesh; base: THREE.Vector3; seed: number }[] = []
    const shells = [
      { n: 4, r: 0.18 },
      { n: 12, r: 0.46 },
    ]
    let idx = 0
    for (const shell of shells) {
      for (let i = 0; i < shell.n; i++) {
        const mesh = new THREE.Mesh(nucleonGeo, idx % 2 === 0 ? protonMat : neutronMat)
        const base = fibonacci(i, shell.n, shell.r)
        mesh.position.copy(base)
        nucleus.add(mesh)
        nucleons.push({ mesh, base, seed: Math.random() * Math.PI * 2 })
        idx++
      }
    }
    const coreGlowMat = track(
      new THREE.SpriteMaterial({ map: glow, transparent: true, depthWrite: false }),
    )
    const coreGlow = new THREE.Sprite(coreGlowMat)
    coreGlow.scale.setScalar(3.2)
    atom.add(coreGlow)

    // Orbits, electrons and comet trails
    const ringPoints = new THREE.EllipseCurve(0, 0, RX, RY).getPoints(160)
    const ringGeo = track(new THREE.BufferGeometry().setFromPoints(ringPoints))
    const ringMat = track(new THREE.LineBasicMaterial({ transparent: true, depthWrite: false }))
    const electronGeo = track(new THREE.SphereGeometry(0.1, 20, 20))
    const electronMat = track(new THREE.MeshBasicMaterial())
    const electronGlowMat = track(
      new THREE.SpriteMaterial({ map: glow, transparent: true, depthWrite: false }),
    )
    const trailMat = track(
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

    const alphas = new Float32Array(TRAIL)
    for (let i = 0; i < TRAIL; i++) alphas[i] = Math.pow(1 - i / TRAIL, 1.6)

    const orbits = ORBITS.map((o) => {
      const group = new THREE.Group()
      group.rotation.z = o.rz
      atom.add(group)
      group.add(new THREE.LineLoop(ringGeo, ringMat))
      const electron = new THREE.Mesh(electronGeo, electronMat)
      const halo = new THREE.Sprite(electronGlowMat)
      halo.scale.setScalar(0.9)
      electron.add(halo)
      group.add(electron)
      const positions = new Float32Array(TRAIL * 3)
      const geo = track(new THREE.BufferGeometry())
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
      geo.setAttribute("alpha", new THREE.BufferAttribute(alphas, 1))
      group.add(new THREE.Points(geo, trailMat))
      return { ...o, electron, positions, geo }
    })

    // Background dust
    const DUST = 260
    const dustPos = new Float32Array(DUST * 3)
    for (let i = 0; i < DUST; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(4.5 + Math.random() * 4)
      dustPos.set([v.x, v.y, v.z], i * 3)
    }
    const dustGeo = track(new THREE.BufferGeometry())
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3))
    const dustMat = track(
      new THREE.PointsMaterial({ size: 0.05, transparent: true, depthWrite: false, map: glow }),
    )
    const dust = new THREE.Points(dustGeo, dustMat)
    scene.add(dust)

    const setColors = (p: Palette, isDark: boolean) => {
      const blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending
      protonMat.color.set(p[400])
      protonMat.emissive.set(p[600])
      protonMat.emissiveIntensity = isDark ? 0.35 : 0.15
      neutronMat.color.set(isDark ? "#cbd5e1" : "#94a3b8")
      key.color.set(isDark ? "#ffffff" : p[400])
      rim.color.set(p[400])
      coreGlowMat.color.set(p[400])
      coreGlowMat.opacity = isDark ? 0.55 : 0.35
      coreGlowMat.blending = blending
      ringMat.color.set(isDark ? p[400] : p[600])
      ringMat.opacity = isDark ? 0.28 : 0.4
      electronMat.color.set(isDark ? "#ffffff" : p[800])
      electronGlowMat.color.set(p[400])
      electronGlowMat.opacity = isDark ? 0.9 : 0.5
      electronGlowMat.blending = blending
      trailMat.uniforms.uColor.value.set(isDark ? p[400] : p[600])
      trailMat.uniforms.uOpacity.value = isDark ? 0.9 : 0.75
      trailMat.blending = blending
      dustMat.color.set(isDark ? p[400] : p[600])
      dustMat.opacity = isDark ? 0.55 : 0.35
      for (const m of [coreGlowMat, electronGlowMat, trailMat, dustMat, ringMat]) m.needsUpdate = true
    }
    setColors(colorsRef.current.palette, colorsRef.current.dark)
    apiRef.current = { setColors }

    // Sizing: keep the whole atom in frame for any aspect ratio
    const resize = () => {
      const { width, height } = mount.getBoundingClientRect()
      if (!width || !height) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      // trail points are sized in pixels, so shrink them with the canvas
      trailMat.uniforms.uScale.value = Math.min(1.2, Math.max(0.35, height / 480))
      const fit = camera.aspect < 1 ? 9.4 / camera.aspect : 9.4
      camera.position.set(0, 0, fit)
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(mount)
    resize()

    // Interaction: tilt toward the pointer, drag to spin, click to excite
    const tilt = { x: 0, y: 0 }
    let spin = 0
    let excite = 0
    let dragging = false
    let dragMoved = 0
    let lastX = 0
    const onPointerMove = (e: PointerEvent) => {
      const r = mount.getBoundingClientRect()
      tilt.x = ((e.clientY - r.top) / r.height - 0.5) * 0.6
      tilt.y = ((e.clientX - r.left) / r.width - 0.5) * 0.6
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
      if (dragging && dragMoved < 6) excite = 1
      dragging = false
      if (mount.hasPointerCapture(e.pointerId)) mount.releasePointerCapture(e.pointerId)
    }
    window.addEventListener("pointermove", onPointerMove)
    mount.addEventListener("pointerdown", onPointerDown)
    mount.addEventListener("pointerup", onPointerUp)
    mount.addEventListener("pointercancel", onPointerUp)

    // Animation loop, paused while off screen or in a background tab
    let last = performance.now()
    const tmp = new THREE.Vector3()
    const motion = reducedMotion ? 0.15 : 1
    let t = 0
    let elapsed = 0

    const frame = () => {
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      elapsed += dt * motion
      excite = Math.max(0, excite - dt * 0.9)
      const boost = 1 + excite * 3.5
      t += dt * motion * boost * 1.6

      spin *= 0.94
      atom.rotation.y += dt * motion * 0.22 + spin
      atom.rotation.x += (0.35 + tilt.x - atom.rotation.x) * 0.05
      atom.rotation.z += (-tilt.y * 0.5 - atom.rotation.z) * 0.05

      nucleus.rotation.x += dt * motion * 0.4
      nucleus.rotation.y += dt * motion * 0.55
      const pulse = 1 + Math.sin(elapsed * 2.2) * 0.03 + excite * 0.25
      nucleus.scale.setScalar(pulse)
      for (const n of nucleons) {
        const j = 0.018 * (1 + excite * 4)
        n.mesh.position.set(
          n.base.x + Math.sin(elapsed * 3 + n.seed) * j,
          n.base.y + Math.cos(elapsed * 2.6 + n.seed) * j,
          n.base.z + Math.sin(elapsed * 2.2 + n.seed * 2) * j,
        )
      }
      coreGlow.scale.setScalar(3.2 * (1 + excite * 0.8) + Math.sin(elapsed * 2.2) * 0.1)

      for (const o of orbits) {
        const a = t * o.speed + o.phase
        ellipse(a, o.electron.position)
        for (let i = 0; i < TRAIL; i++) {
          ellipse(a - i * 0.028, tmp)
          o.positions[i * 3] = tmp.x
          o.positions[i * 3 + 1] = tmp.y
          o.positions[i * 3 + 2] = tmp.z
        }
        o.geo.attributes.position.needsUpdate = true
      }

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
      for (const d of disposables) d.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
      apiRef.current = null
    }
  }, [])

  // Below lg the atom becomes a small floating widget in the bottom-right corner
  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="fixed right-3 bottom-3 z-40 size-24 cursor-grab touch-none overflow-hidden rounded-full border border-border/60 bg-background/70 shadow-lg backdrop-blur-md select-none active:cursor-grabbing sm:size-28 lg:relative lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent lg:shadow-none lg:backdrop-blur-none lg:right-auto lg:bottom-auto lg:z-auto lg:mx-auto lg:aspect-square lg:size-auto lg:w-full lg:max-w-[520px] lg:touch-pan-y"
    />
  )
}
