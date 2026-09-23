'use client';

import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { usePointerRef } from '@/lib/hooks';

/**
 * LAYER 1 — AMBIENT BACKGROUND
 *
 * One full-screen quad and one points cloud: two draw calls for the entire
 * background layer, regardless of how much is happening in the shader.
 *
 * The quad ignores the camera entirely (its vertex shader writes clip space
 * directly), so it costs nothing to keep behind the product at any camera
 * distance — which matters because the scroll story moves the camera a lot.
 *
 * Palette is passed as raw sRGB component values rather than THREE.Color, since
 * a raw ShaderMaterial bypasses three's linear→sRGB output conversion. Authoring
 * in sRGB here is what keeps the backdrop colour-identical to the CSS palette.
 */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 1.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uScroll;
  uniform float uIntensity;
  uniform vec3 uInk;
  uniform vec3 uWarm;
  uniform vec3 uAccent;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < OCTAVES; i++) {
      v += a * noise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(1.7, 1.0);

    // Pointer parallax is deliberately tiny: the backdrop should feel aware of
    // the cursor, never follow it.
    p += uPointer * 0.055;

    float t = uTime * 0.032;
    float f = fbm(p * 1.35 + vec2(t, -t * 0.7) + uScroll * 0.28);

    // A soft warm pool of sand/gold light behind the object, drifting slowly on bone/cream
    float pool = smoothstep(0.75, 0.0, length(p - vec2(0.04, -0.02) * 1.0));
    pool *= 0.6 + 0.4 * f;

    vec3 col = mix(uInk, uWarm, pool * 0.5);
    col = mix(col, uAccent, smoothstep(0.7, 1.0, f) * 0.06);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function AmbientLayer({
  intensity = 1,
  motes = true,
  octaves = 4,
}: {
  intensity?: number;
  motes?: boolean;
  octaves?: number;
}) {
  const pointer = usePointerRef();
  const group = useRef<THREE.Group>(null);
  const scroll = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0 },
      uIntensity: { value: intensity },
      // sRGB values matching:
      // uInk = #F7F3EC (bone/cream), uWarm = #EFE7DA (sand), uAccent = #8A6D3B (gold/bronze)
      uInk: { value: new THREE.Vector3(0.969, 0.953, 0.925) },
      uWarm: { value: new THREE.Vector3(0.937, 0.906, 0.855) },
      uAccent: { value: new THREE.Vector3(0.541, 0.427, 0.231) },
    }),
    [intensity],
  );

  const moteCount = octaves > 2 ? 80 : 40;
  const motePositions = useMemo(() => {
    const arr = new Float32Array(moteCount * 3);
    for (let i = 0; i < moteCount; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 7;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 4.5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 3.5 - 0.5;
    }
    return arr;
  }, [moteCount]);

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;

    const p = pointer.current;
    const u = uniforms.uPointer.value;
    u.x += (p.x - u.x) * 0.035;
    u.y += (p.y - u.y) * 0.035;

    const targetScroll = window.scrollY / Math.max(1, window.innerHeight);
    scroll.current += (targetScroll - scroll.current) * 0.06;
    uniforms.uScroll.value = scroll.current;

    if (group.current) {
      // Dust drifts upward and turns almost imperceptibly.
      group.current.rotation.y = state.clock.elapsedTime * 0.016;
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.18) * 0.06;
    }
  });

  return (
    <>
      <mesh renderOrder={-1} frustumCulled={false}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          defines={{ OCTAVES: octaves }}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      {motes && (
        <group ref={group}>
          <points frustumCulled={false}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[motePositions, 3]}
              />
            </bufferGeometry>
            <pointsMaterial
              size={0.02}
              color="#8a6d3b"
              transparent
              opacity={0.25}
              sizeAttenuation
              depthWrite={false}
            />
          </points>
        </group>
      )}
    </>
  );
}
