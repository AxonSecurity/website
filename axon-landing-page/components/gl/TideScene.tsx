'use client'

import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import TideParticles from './TideParticles'

const CAMERA_POSITION: [number, number, number] = [
  1.2629783123314589, 2.664606471394044, -1.8178993743288914,
]

interface TideSceneProps {
  simSize: number
  introspect: boolean
  active: boolean
}

export default function TideScene({
  simSize,
  introspect,
  active,
}: TideSceneProps) {
  return (
    <Canvas
      camera={{ position: CAMERA_POSITION, fov: 50, near: 0.01, far: 300 }}
      dpr={[1, 2]}
      frameloop={active ? 'always' : 'never'}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color('#0b0c0a'), 1)
      }}
    >
      <TideParticles
        simSize={simSize}
        planeScale={10}
        introspect={introspect}
      />
    </Canvas>
  )
}
