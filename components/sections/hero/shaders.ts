// GLSL for the estate graph. Every layer shares one "float" function so
// edges and signals stay welded to the nodes they connect.

const FLOAT = /* glsl */ `
  vec3 floatOffset(float seed, float time) {
    return vec3(
      sin(time * 0.55 + seed * 31.0),
      cos(time * 0.47 + seed * 17.0),
      sin(time * 0.39 + seed * 11.0)
    ) * 0.035;
  }
  float easeOut(float t) { return 1.0 - pow(1.0 - t, 3.0); }
  float formation(float form, float delay) {
    return easeOut(clamp((form * 1.55 - delay * 0.55), 0.0, 1.0));
  }
`

export const nodeVertex = /* glsl */ `
  attribute vec3 aScatter;
  attribute float aType;
  attribute float aSize;
  attribute float aDelay;
  attribute float aSeed;
  attribute float aHi;
  attribute float aDim;

  uniform float uTime;
  uniform float uForm;
  uniform float uPixel;
  uniform float uScale;

  varying float vType;
  varying float vHi;
  varying float vDim;
  varying float vAlpha;
  varying float vDepth;

  ${FLOAT}

  void main() {
    float f = formation(uForm, aDelay);
    vec3 pos = mix(aScatter, position, f) + floatOffset(aSeed, uTime);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    float pulse = 1.0 + aHi * (0.35 + 0.08 * sin(uTime * 4.0 + aSeed * 6.0));
    gl_PointSize = aSize * uScale * uPixel * pulse / -mv.z;
    vType = aType;
    vHi = aHi;
    vDim = aDim;
    vAlpha = f;
    vDepth = clamp((-mv.z - 4.0) / 10.0, 0.0, 1.0);
  }
`

export const nodeFragment = /* glsl */ `
  precision highp float;
  uniform vec3 uPaper;
  uniform vec3 uLime;
  uniform float uFade;

  varying float vType;
  varying float vHi;
  varying float vDim;
  varying float vAlpha;
  varying float vDepth;

  float band(float d, float r, float w) {
    return 1.0 - smoothstep(w * 0.5, w, abs(d - r));
  }

  void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float d = length(uv);
    float shape = 0.0;
    float t = floor(vType + 0.5);

    if (t < 0.5) {
      // agent: ring + core
      shape = band(d, 0.68, 0.16) + (1.0 - smoothstep(0.16, 0.26, d)) * 0.9;
    } else if (t < 1.5) {
      // MCP server: diamond outline + faint fill
      float m = abs(uv.x) + abs(uv.y);
      shape = band(m, 0.7, 0.15) + (1.0 - smoothstep(0.6, 0.7, m)) * 0.18;
    } else if (t < 2.5) {
      // data store: square outline + faint fill
      float m = max(abs(uv.x), abs(uv.y));
      shape = band(m, 0.62, 0.14) + (1.0 - smoothstep(0.52, 0.6, m)) * 0.2;
    } else if (t < 3.5) {
      // identity: dot with a halo
      shape = (1.0 - smoothstep(0.24, 0.34, d)) + (1.0 - smoothstep(0.3, 1.0, d)) * 0.28;
    } else {
      // model / tool: plain dot
      shape = 1.0 - smoothstep(0.34, 0.52, d);
    }

    if (shape < 0.01) discard;
    vec3 color = mix(uPaper, uLime, vHi);
    float base = mix(0.85, 0.5, vDepth);
    float alpha = shape * mix(base, 1.0, vHi) * (1.0 - vDim * 0.78) * vAlpha * uFade;
    gl_FragColor = vec4(color, alpha);
  }
`

export const edgeVertex = /* glsl */ `
  attribute float aT;
  attribute float aDelay;
  attribute float aSeed;
  attribute float aHi;
  attribute float aDim;

  uniform float uTime;

  varying float vT;
  varying float vDelay;
  varying float vHi;
  varying float vDim;

  ${FLOAT}

  void main() {
    vec3 pos = position + floatOffset(aSeed, uTime);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    vT = aT;
    vDelay = aDelay;
    vHi = aHi;
    vDim = aDim;
  }
`

export const edgeFragment = /* glsl */ `
  precision highp float;
  uniform vec3 uPaper;
  uniform vec3 uLime;
  uniform float uReveal;
  uniform float uTime;
  uniform float uFade;

  varying float vT;
  varying float vDelay;
  varying float vHi;
  varying float vDim;

  void main() {
    float reveal = clamp(uReveal * 1.6 - vDelay * 0.6, 0.0, 1.0);
    if (vT > reveal) discard;
    float head = smoothstep(reveal - 0.18, reveal, vT) * step(reveal, 0.999);
    float march = 0.55 + 0.45 * step(0.5, fract(vT * 7.0 - uTime * 1.8));
    vec3 color = mix(uPaper, uLime, max(vHi, head));
    float alpha = mix(0.2, 0.85 * march, vHi) * (1.0 - vDim * 0.8) + head * 0.6;
    gl_FragColor = vec4(color, alpha * uFade);
  }
`

export const signalVertex = /* glsl */ `
  attribute vec3 aStart;
  attribute vec3 aEnd;
  attribute float aSeedA;
  attribute float aSeedB;
  attribute float aSpeed;
  attribute float aOffset;
  attribute float aHi;
  attribute float aDim;

  uniform float uTime;
  uniform float uPixel;
  uniform float uScale;

  varying float vAlpha;
  varying float vHi;
  varying float vDim;

  ${FLOAT}

  void main() {
    float t = fract(uTime * aSpeed + aOffset);
    vec3 a = aStart + floatOffset(aSeedA, uTime);
    vec3 b = aEnd + floatOffset(aSeedB, uTime);
    vec4 mv = modelViewMatrix * vec4(mix(a, b, t), 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (0.72 + aHi * 0.5) * uScale * uPixel / -mv.z;
    vAlpha = sin(t * 3.14159);
    vHi = aHi;
    vDim = aDim;
  }
`

export const signalFragment = /* glsl */ `
  precision highp float;
  uniform vec3 uLime;
  uniform float uSignals;
  uniform float uFade;

  varying float vAlpha;
  varying float vHi;
  varying float vDim;

  void main() {
    float d = length(gl_PointCoord * 2.0 - 1.0);
    float glow = pow(max(0.0, 1.0 - d), 2.4);
    float alpha = glow * vAlpha * uSignals * uFade * (0.95 + vHi * 0.5) * (1.0 - vDim * 0.85);
    if (alpha < 0.005) discard;
    gl_FragColor = vec4(uLime, alpha);
  }
`

export const dustVertex = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uPixel;
  varying float vAlpha;

  void main() {
    vec3 pos = position;
    pos.y += sin(uTime * 0.12 + aSeed * 40.0) * 0.25;
    pos.x += cos(uTime * 0.09 + aSeed * 23.0) * 0.25;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.0 + aSeed * 1.6) * uPixel;
    float twinkle = 0.6 + 0.4 * sin(uTime * (0.6 + aSeed) + aSeed * 50.0);
    vAlpha = (0.05 + aSeed * 0.22) * twinkle;
  }
`

export const dustFragment = /* glsl */ `
  precision highp float;
  uniform vec3 uPaper;
  uniform vec3 uLime;
  uniform float uDust;
  uniform float uFade;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord * 2.0 - 1.0);
    if (d > 1.0) discard;
    gl_FragColor = vec4(uPaper, vAlpha * (1.0 - d) * uDust * uFade);
  }
`
