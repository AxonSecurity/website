import * as THREE from 'three'
import { periodicNoiseGLSL } from './noise'

const PAPER = new THREE.Color('#f3f2f2')
const LIME = new THREE.Color('#95ff2a')

export class TidePointsMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader: /* glsl */ `
        uniform sampler2D positions;
        uniform sampler2D initialPositions;
        uniform float uTime;
        uniform float uFocus;
        uniform float uBlur;
        uniform float uPointSize;
        varying float vDistance;
        varying float vPosY;
        varying vec3 vWorldPosition;
        varying vec3 vInitialPosition;
        void main() {
          vec3 pos = texture2D(positions, position.xy).xyz;
          vec3 initialPos = texture2D(initialPositions, position.xy).xyz;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          vDistance = abs(uFocus - -mvPosition.z);
          vPosY = pos.y;
          vWorldPosition = pos;
          vInitialPosition = initialPos;
          gl_PointSize = max(vDistance * uBlur * uPointSize, 3.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        uniform float uRevealFactor;
        uniform float uRevealProgress;
        uniform float uTime;
        uniform float uTransition;
        varying float vDistance;
        varying float vPosY;
        varying vec3 vWorldPosition;
        varying vec3 vInitialPosition;

        ${periodicNoiseGLSL}

        float sparkleNoise(vec3 seed, float time) {
          float hash = sin(seed.x * 127.1 + seed.y * 311.7 + seed.z * 74.7) * 43758.5453;
          hash = fract(hash);
          float slowTime = time * 1.0;
          float sparkle = 0.0;
          sparkle += sin(slowTime + hash * 6.28318) * 0.5;
          sparkle += sin(slowTime * 1.7 + hash * 12.56636) * 0.3;
          sparkle += sin(slowTime * 0.8 + hash * 18.84954) * 0.2;
          float hash2 = sin(seed.x * 113.5 + seed.y * 271.9 + seed.z * 97.3) * 37849.3241;
          hash2 = fract(hash2);
          float sparkleMask = sin(hash2 * 6.28318) * 0.7;
          sparkleMask += sin(hash2 * 12.56636) * 0.3;
          if (sparkleMask < 0.3) {
            sparkle *= 0.05;
          }
          float normalizedSparkle = (sparkle + 1.0) * 0.5;
          float smoothCurve = pow(normalizedSparkle, 4.0);
          float blendFactor = normalizedSparkle * normalizedSparkle;
          float finalBrightness = mix(normalizedSparkle, smoothCurve, blendFactor);
          return 0.7 + finalBrightness * 1.3;
        }

        void main() {
          vec2 cxy = 2.0 * gl_PointCoord - 1.0;
          float sdf = length(cxy) - 0.5;
          if (sdf > 0.0) discard;

          float distanceFromCenter = length(vWorldPosition.xz);
          float noiseValue = periodicNoise(vInitialPosition * 4.0, 0.0);
          float revealThreshold = uRevealFactor + noiseValue * 0.3;
          float revealMask = 1.0 - smoothstep(revealThreshold - 0.2, revealThreshold + 0.1, distanceFromCenter);

          float sparkleBrightness = sparkleNoise(vInitialPosition, uTime);
          float sparkTint = smoothstep(1.35, 1.85, sparkleBrightness);

          vec3 baseColor = vec3(${PAPER.r.toFixed(4)}, ${PAPER.g.toFixed(4)}, ${PAPER.b.toFixed(4)});
          vec3 accentColor = vec3(${LIME.r.toFixed(4)}, ${LIME.g.toFixed(4)}, ${LIME.b.toFixed(4)});
          vec3 color = mix(baseColor, accentColor, sparkTint * 0.9);

          float alpha =
            (1.04 - clamp(vDistance, 0.0, 1.0)) *
            clamp(smoothstep(-0.5, 0.25, vPosY), 0.0, 1.0) *
            uOpacity *
            revealMask *
            uRevealProgress *
            sparkleBrightness;

          gl_FragColor = vec4(color, mix(alpha, sparkTint * (sparkleBrightness - 1.0), uTransition));
        }
      `,
      uniforms: {
        positions: { value: null },
        initialPositions: { value: null },
        uTime: { value: 0 },
        uFocus: { value: 3.8 },
        uBlur: { value: 1.79 },
        uTransition: { value: 0.0 },
        uPointSize: { value: 10 },
        uOpacity: { value: 0.8 },
        uRevealFactor: { value: 0.0 },
        uRevealProgress: { value: 0.0 },
      },
      transparent: true,
      depthWrite: false,
    })
  }
}
