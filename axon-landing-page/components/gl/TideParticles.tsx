'use client'

import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { createPortal, useFrame } from '@react-three/fiber'
import { TideSimulationMaterial } from './shaders/tideSimulationMaterial'
import { TidePointsMaterial } from './shaders/tidePointMaterial'

interface TideParticlesProps {
  simSize: number
  planeScale: number
  introspect: boolean
}

function damp(current: number, target: number, tau: number, delta: number) {
  return target + (current - target) * Math.exp(-delta / tau)
}

export default function TideParticles({
  simSize,
  planeScale,
  introspect,
}: TideParticlesProps) {
  const revealStart = useRef<number | null>(null)

  const simulationMaterial = useMemo(
    () => new TideSimulationMaterial(simSize, planeScale),
    [simSize, planeScale],
  )

  const target = useMemo(
    () =>
      new THREE.WebGLRenderTarget(simSize, simSize, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
      }),
    [simSize],
  )

  const pointsMaterial = useMemo(() => {
    const m = new TidePointsMaterial()
    m.uniforms.positions.value = target.texture
    m.uniforms.initialPositions.value =
      simulationMaterial.uniforms.positions.value
    return m
  }, [simulationMaterial, target])

  const [simScene] = useState(() => new THREE.Scene())
  const [simCamera] = useState(
    () => new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / 2 ** 53, 1),
  )
  const [quadPositions] = useState(
    () =>
      new Float32Array([
        -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0,
      ]),
  )
  const [quadUvs] = useState(
    () => new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0]),
  )

  const particlePositions = useMemo(() => {
    const length = simSize * simSize
    const data = new Float32Array(length * 3)
    for (let i = 0; i < length; i += 1) {
      data[i * 3 + 0] = (i % simSize) / simSize
      data[i * 3 + 1] = i / simSize / simSize
    }
    return data
  }, [simSize])

  useFrame((state, delta) => {
    state.gl.setRenderTarget(target)
    state.gl.clear()
    state.gl.render(simScene, simCamera)
    state.gl.setRenderTarget(null)

    const time = state.clock.elapsedTime
    const started = revealStart.current

    if (started === null) {
      revealStart.current = time
    }
    const revealProgress =
      Math.min((time - (started ?? time)) / 3.5, 1)
    const eased = 1 - (1 - revealProgress) ** 3
    const revealFactor = eased * 4.0

    pointsMaterial.uniforms.uTime.value = time
    pointsMaterial.uniforms.uRevealFactor.value = revealFactor
    pointsMaterial.uniforms.uRevealProgress.value = eased
    pointsMaterial.uniforms.uTransition.value = damp(
      pointsMaterial.uniforms.uTransition.value,
      introspect ? 1 : 0,
      introspect ? 0.12 : 0.07,
      delta,
    )

    simulationMaterial.uniforms.uTime.value = time
  })

  return (
    <>
      {createPortal(
        <mesh material={simulationMaterial}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[quadPositions, 3]} />
            <bufferAttribute attach="attributes-uv" args={[quadUvs, 2]} />
          </bufferGeometry>
        </mesh>,
        simScene,
      )}
      <points material={pointsMaterial} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
      </points>
    </>
  )
}
