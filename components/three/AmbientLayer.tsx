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
 * Rich architectural palette: limestone alabaster, honed travertine,
 * and burnished copper light.
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

    // Subtle pointer parallax
    p += uPointer * 0.045;

    float t = uTime * 0.032;
    float f = fbm(p * 1.35 + vec2(t, -t * 0.7) + uScroll * 0.28);

    // A soft warm pool of travertine light behind the object
    float pool = smoothstep(0.85, 0.0, length(p - vec2(0.03, -0.01)));
    pool *= 0.5 + 0.5 * f;

    vec3 col = mix(uInk, uWarm, pool * 0.6);
    col = mix(col, uAccent, smoothstep(0.7, 1.0, f) * 0.05);

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
      // Rich architectural limestone & travertine studio palette:
      // uInk = #F6F2EB (limestone alabaster base)
      // uWarm = #ECE5D8 (honed travertine)
      // uAccent = #C29547 (warm champagne/copper reflection)
      uInk: { value: new THREE.Vector3(0.965, 0.949, 0.922) },
      uWarm: { value: new THREE.Vector3(0.925, 0.898, 0.847) },
      uAccent: { value: new THREE.Vector3(0.761, 0.584, 0.278) },
    }),
    [intensity],
  );

  const moteCount = octaves > 2 ? 70 : 35;
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
      group.current.rotation.y = state.clock.elapsedTime * 0.014;
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.16) * 0.06;
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
              color="#9e6b47"
              transparent
              opacity={0.22}
              sizeAttenuation
              depthWrite={false}
            />
          </points>
        </group>
      )}
    </>
  );
}
