import { useEffect, useRef } from "react"
import * as THREE from "three"
import { LineMaterial } from "three/addons/lines/LineMaterial.js"
import { LineSegments2 } from "three/addons/lines/LineSegments2.js"
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js"
import { usePreferences } from "@/context/preferences"
import type { Palette } from "@/lib/content"
import { cn } from "@/lib/utils"

// Tesseract: 16 vertices at (±1, ±1, ±1, ±1); edges join vertices differing in one axis
const VERTS = Array.from({ length: 16 }, (_, i) => [0, 1, 2, 3].map((b) => ((i >> b) & 1 ? 1 : -1)))
const EDGES: [number, number][] = []
for (let i = 0; i < 16; i++) {
  for (let b = 0; b < 4; b++) {
    const j = i ^ (1 << b)
    if (i < j) EDGES.push([i, j])
  }
}
const NEIGHBOURS = VERTS.map((_, i) => [0, 1, 2, 3].map((b) => i ^ (1 << b)))
const PACKETS = 2
const TAIL = 8

type SceneApi = { setColors: (palette: Palette, dark: boolean) => void }

const packetVertex = /* glsl */ `
  attribute float alpha;
  uniform float uSize;
  varying float vAlpha;
  void main() {
    vAlpha = alpha;
    gl_PointSize = uSize * mix(0.35, 1.0, alpha);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const packetFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(uColor, smoothstep(0.5, 0.05, d) * vAlpha);
  }
`

/** Small rotating 4D hypercube with data packets hopping along its edges. */
export default function LogoScene({ className }: { className?: string }) {
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
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50)
    camera.position.set(0, 0, 7.2)
    const group = new THREE.Group()
    group.rotation.set(0.45, 0.6, 0)
    scene.add(group)

    // Edges as fat lines; positions/colours rewritten in place every frame
    const edgeGeo = new LineSegmentsGeometry()
    edgeGeo.setPositions(new Float32Array(EDGES.length * 6))
    edgeGeo.setColors(new Float32Array(EDGES.length * 6))
    const edgePos = edgeGeo.attributes.instanceStart as THREE.InterleavedBufferAttribute
    const edgeCol = edgeGeo.attributes.instanceColorStart as THREE.InterleavedBufferAttribute
    const edgeMat = new LineMaterial({ vertexColors: true, transparent: true, linewidth: 1.6 })
    const edges = new LineSegments2(edgeGeo, edgeMat)
    edges.frustumCulled = false
    group.add(edges)

    // Vertices as soft dots
    const vertPos = new Float32Array(16 * 3)
    const vertAlpha = new Float32Array(16).fill(0.55)
    const vertGeo = new THREE.BufferGeometry()
    vertGeo.setAttribute("position", new THREE.BufferAttribute(vertPos, 3))
    vertGeo.setAttribute("alpha", new THREE.BufferAttribute(vertAlpha, 1))
    const vertMat = new THREE.ShaderMaterial({
      vertexShader: packetVertex,
      fragmentShader: packetFragment,
      uniforms: { uColor: { value: new THREE.Color() }, uSize: { value: 6 } },
      transparent: true,
      depthWrite: false,
    })
    const verts = new THREE.Points(vertGeo, vertMat)
    verts.frustumCulled = false
    group.add(verts)

    // Packets hopping vertex → neighbour, with a short tail along the edge
    const packets = Array.from({ length: PACKETS }, (_, i) => ({
      from: i * 5,
      to: NEIGHBOURS[i * 5][i],
      prev: -1,
      p: Math.random(),
      speed: 1.6 + i * 0.5,
    }))
    const packPos = new Float32Array(PACKETS * TAIL * 3)
    const packAlpha = new Float32Array(PACKETS * TAIL)
    for (let k = 0; k < TAIL; k++) {
      for (let i = 0; i < PACKETS; i++) packAlpha[i * TAIL + k] = Math.pow(1 - k / TAIL, 1.4)
    }
    const packGeo = new THREE.BufferGeometry()
    packGeo.setAttribute("position", new THREE.BufferAttribute(packPos, 3))
    packGeo.setAttribute("alpha", new THREE.BufferAttribute(packAlpha, 1))
    const packMat = new THREE.ShaderMaterial({
      vertexShader: packetVertex,
      fragmentShader: packetFragment,
      uniforms: { uColor: { value: new THREE.Color() }, uSize: { value: 12 } },
      transparent: true,
      depthWrite: false,
    })
    const packCloud = new THREE.Points(packGeo, packMat)
    packCloud.frustumCulled = false
    group.add(packCloud)

    const outer = new THREE.Color()
    const inner = new THREE.Color()
    const setColors = (p: Palette, isDark: boolean) => {
      const blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending
      outer.set(isDark ? p[400] : p[600])
      inner.set(isDark ? "#e2e8f0" : p[800])
      edgeMat.opacity = isDark ? 0.95 : 1
      vertMat.uniforms.uColor.value.set(isDark ? "#ffffff" : p[800])
      packMat.uniforms.uColor.value.set(isDark ? "#ffffff" : p[600])
      for (const mat of [edgeMat, vertMat, packMat]) {
        mat.blending = blending
        mat.needsUpdate = true
      }
    }
    setColors(colorsRef.current.palette, colorsRef.current.dark)
    apiRef.current = { setColors }

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect()
      if (!width || !height) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      edgeMat.resolution.set(width, height)
      // keep dots proportional to the canvas (sizes are in device pixels)
      const k = (height / 52) * pixelRatio
      vertMat.uniforms.uSize.value = 3.5 * k
      packMat.uniforms.uSize.value = 6 * k
      edgeMat.linewidth = Math.max(1.2, 1.6 * (height / 52))
    }
    const ro = new ResizeObserver(resize)
    ro.observe(mount)
    resize()

    // Hover speeds it up; click gives it a spin
    let hover = 0
    let hovering = false
    let kick = 0
    const onEnter = () => (hovering = true)
    const onLeave = () => (hovering = false)
    const onDown = () => (kick = 1)
    mount.addEventListener("pointerenter", onEnter)
    mount.addEventListener("pointerleave", onLeave)
    mount.addEventListener("pointerdown", onDown)

    // 4D rotation (XW + YZ planes) then perspective projection 4D → 3D
    const projected = VERTS.map(() => new THREE.Vector3())
    const wDepth = new Float32Array(16)
    const project = (a: number, b: number) => {
      const ca = Math.cos(a)
      const sa = Math.sin(a)
      const cb = Math.cos(b)
      const sb = Math.sin(b)
      VERTS.forEach(([x, y, z, w], i) => {
        const x1 = x * ca - w * sa
        const w1 = x * sa + w * ca
        const y1 = y * cb - z * sb
        const z1 = y * sb + z * cb
        const k = 1 / (3 - w1)
        projected[i].set(x1 * k * 2.2, y1 * k * 2.2, z1 * k * 2.2)
        wDepth[i] = (w1 + 1) / 2 // 0 = inner cube, 1 = outer cube
      })
    }

    const tmpColor = new THREE.Color()
    const tmp = new THREE.Vector3()
    const motion = reducedMotion ? 0.15 : 1
    let last = performance.now()
    let a = 0
    let b = 0

    const frame = () => {
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      hover += ((hovering ? 1 : 0) - hover) * 0.08
      kick = Math.max(0, kick - dt * 0.8)
      const speed = motion * (1 + hover * 1.5 + kick * 5)
      a += dt * 0.55 * speed
      b += dt * 0.3 * speed
      group.rotation.y += dt * 0.12 * speed

      project(a, b)

      const ep = edgePos.data.array as Float32Array
      const ec = edgeCol.data.array as Float32Array
      EDGES.forEach(([i, j], e) => {
        const pi = projected[i]
        const pj = projected[j]
        ep.set([pi.x, pi.y, pi.z, pj.x, pj.y, pj.z], e * 6)
        tmpColor.lerpColors(inner, outer, wDepth[i])
        ec.set([tmpColor.r, tmpColor.g, tmpColor.b], e * 6)
        tmpColor.lerpColors(inner, outer, wDepth[j])
        ec.set([tmpColor.r, tmpColor.g, tmpColor.b], e * 6 + 3)
      })
      edgePos.data.needsUpdate = true
      edgeCol.data.needsUpdate = true

      projected.forEach((v, i) => vertPos.set([v.x, v.y, v.z], i * 3))
      vertGeo.attributes.position.needsUpdate = true

      packets.forEach((pk, n) => {
        pk.p += dt * pk.speed * speed * 0.6
        if (pk.p >= 1) {
          // arrive: hop to a random neighbour that isn't where we came from
          const options = NEIGHBOURS[pk.to].filter((v) => v !== pk.from)
          pk.prev = pk.from
          pk.from = pk.to
          pk.to = options[Math.floor(Math.random() * options.length)]
          pk.p -= 1
        }
        for (let k = 0; k < TAIL; k++) {
          const along = Math.max(0, pk.p - k * 0.07)
          tmp.lerpVectors(projected[pk.from], projected[pk.to], along)
          packPos.set([tmp.x, tmp.y, tmp.z], (n * TAIL + k) * 3)
        }
      })
      packGeo.attributes.position.needsUpdate = true

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
      mount.removeEventListener("pointerenter", onEnter)
      mount.removeEventListener("pointerleave", onLeave)
      mount.removeEventListener("pointerdown", onDown)
      for (const d of [edgeGeo, edgeMat, vertGeo, vertMat, packGeo, packMat]) d.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
      apiRef.current = null
    }
  }, [])

  return <div ref={mountRef} aria-hidden="true" className={cn("select-none", className)} />
}
