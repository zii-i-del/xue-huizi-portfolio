import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

function QuillMesh({ entered }) {
  const group = useRef(null)
  const scrollTarget = useRef(0)

  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 2.85)
    shape.bezierCurveTo(-0.58, 2.42, -0.86, 1.6, -0.7, 0.76)
    shape.lineTo(-0.28, 1.08)
    shape.lineTo(-0.62, 0.38)
    shape.lineTo(-0.2, 0.66)
    shape.lineTo(-0.42, -0.06)
    shape.lineTo(-0.08, 0.18)
    shape.lineTo(0, -1.72)
    shape.lineTo(0.08, 0.18)
    shape.lineTo(0.42, -0.06)
    shape.lineTo(0.2, 0.66)
    shape.lineTo(0.62, 0.38)
    shape.lineTo(0.28, 1.08)
    shape.lineTo(0.7, 0.76)
    shape.bezierCurveTo(0.86, 1.6, 0.58, 2.42, 0, 2.85)
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: 0.16,
      bevelEnabled: false,
      curveSegments: 3,
    })
    g.center()
    return g
  }, [])

  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 18), [geometry])

  useEffect(() => {
    const onScroll = () => {
      scrollTarget.current = Math.min(1, window.scrollY / Math.max(1, window.innerHeight))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(
    () => () => {
      geometry.dispose()
      edges.dispose()
    },
    [edges, geometry]
  )

  useFrame((_, delta) => {
    if (!group.current) return
    const p = scrollTarget.current
    const enter = entered ? 1 : 0
    const ease = Math.min(1, delta * 4.5)
    group.current.rotation.x += (-0.16 + p * 0.12 - group.current.rotation.x) * ease
    group.current.rotation.y += (0.55 - enter * 0.46 + p * 0.2 - group.current.rotation.y) * ease
    group.current.rotation.z += (-0.28 + enter * 0.22 - p * 0.16 - group.current.rotation.z) * ease
    group.current.position.y += (-0.25 + enter * 0.25 - p * 0.36 - group.current.position.y) * ease
    const scale = 0.82 + enter * 0.18
    group.current.scale.lerp(new THREE.Vector3(scale, scale, scale), ease)
  })

  return (
    <group ref={group} scale={0.82}>
      <mesh geometry={geometry}>
        <meshBasicMaterial color="#000000" />
      </mesh>
      <lineSegments geometry={edges} scale={1.012}>
        <lineBasicMaterial color="#D7ABC5" transparent opacity={0.9} />
      </lineSegments>
      <mesh position={[0, -1.75, 0.08]} rotation={[0, 0, -0.02]}>
        <cylinderGeometry args={[0.035, 0.085, 1.55, 5]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
    </group>
  )
}

function StaticQuill() {
  return (
    <svg viewBox="0 0 180 320" className="h-full w-full" aria-hidden="true">
      <path
        d="M90 8C38 46 21 124 48 201l27-21-18 47 27-18 6 103 7-103 27 18-18-47 27 21C160 124 142 46 90 8Z"
        fill="#000"
        stroke="var(--theme-contrast)"
        strokeWidth="1.2"
      />
    </svg>
  )
}

export default function HeroQuill({ entered }) {
  const [supported] = useState(() => typeof document !== 'undefined' && supportsWebGL())

  useEffect(() => {
    if (!supported) {
      window.__heroQuillReady = true
      window.dispatchEvent(new Event('hero-quill-ready'))
    }
  }, [supported])

  if (!supported) return <StaticQuill />

  return (
    <Canvas
      orthographic
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 8], zoom: 70, near: 0.1, far: 30 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={() => {
        window.__heroQuillReady = true
        window.dispatchEvent(new Event('hero-quill-ready'))
      }}
      aria-hidden="true"
    >
      <QuillMesh entered={entered} />
    </Canvas>
  )
}
