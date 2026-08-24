import * as THREE from 'three'
import { periodicNoiseGLSL } from './noise'

export const TIDE_LOOP_PERIOD = 24.0

function getPlane(count: number, components: number, size: number, scale: number) {
  const length = count * components
  const data = new Float32Array(length)

  for (let i = 0; i < count; i += 1) {
    const iC = i * components
    const x = (i % size) / (size - 1)
    const z = Math.floor(i / size) / (size - 1)
    data[iC + 0] = (x - 0.5) * 2 * scale
    data[iC + 1] = 0
    data[iC + 2] = (z - 0.5) * 2 * scale
    data[iC + 3] = 1.0
  }

  return data
}

export class TideSimulationMaterial extends THREE.ShaderMaterial {
  constructor(simSize: number, planeScale: number) {
    const positionsTexture = new THREE.DataTexture(
      getPlane(simSize * simSize, 4, simSize, planeScale),
      simSize,
      simSize,
      THREE.RGBAFormat,
      THREE.FloatType,
    )
    positionsTexture.needsUpdate = true

    super({
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D positions;
        uniform float uTime;
        uniform float uNoiseScale;
        uniform float uNoiseIntensity;
        uniform float uTimeScale;
        uniform float uLoopPeriod;
        varying vec2 vUv;

        ${periodicNoiseGLSL}

        void main() {
          vec3 originalPos = texture2D(positions, vUv).rgb;
          float continuousTime = uTime * uTimeScale * (6.28318530718 / uLoopPeriod);
          vec3 noiseInput = originalPos * uNoiseScale;

          float displacementX = periodicNoise(noiseInput, continuousTime);
          float displacementY = periodicNoise(noiseInput + vec3(50.0, 0.0, 0.0), continuousTime + 2.094);
          float displacementZ = periodicNoise(noiseInput + vec3(0.0, 50.0, 0.0), continuousTime + 4.188);

          vec3 distortion = vec3(displacementX, displacementY, displacementZ) * uNoiseIntensity;
          gl_FragColor = vec4(originalPos + distortion, 1.0);
        }
      `,
      uniforms: {
        positions: { value: positionsTexture },
        uTime: { value: 0 },
        uNoiseScale: { value: 0.6 },
        uNoiseIntensity: { value: 0.52 },
        uTimeScale: { value: 1 },
        uLoopPeriod: { value: TIDE_LOOP_PERIOD },
      },
    })
  }
}
