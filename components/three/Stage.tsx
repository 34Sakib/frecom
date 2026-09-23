'use client';

import * as THREE from 'three';
import { Suspense, useEffect, useRef, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { StudioEnvironment } from './StudioEnvironment';
import { FLOOR_Y } from './ProductModels';
import { useLoad } from '@/lib/store';
import { canRender3D, useCapability } from '@/lib/hooks';

/**
 * Marks the hero as genuinely ready: the beacon fires on the first frame the GPU
 * actually drew, so the loader is gated on a real frame rather than a timer.
 * `settleFrames` keeps asking for frames while the scene is in 'demand' mode, so
 * the one-off bakes (environment cube, contact shadows) finish rather than
 * freezing half-drawn on a reduced-motion device.
 */
function FrameBeacon({ settleFrames }: { settleFrames: boolean }) {
  const markScene = useLoad((s) => s.markScene);
  const invalidate = useThree((s) => s.invalidate);
  const drawn = useRef(0);

  useFrame(() => {
    drawn.current += 1;
    if (drawn.current === 1) markScene();
    if (settleFrames && drawn.current < 8) invalidate();
  });

  return null;
}

export type StageProps = {
  children: ReactNode;
  /** Static framing. Per-model defaults live in ProductModels › FRAMING. */
  camera?: [number, number, number];
  target?: [number, number, number];
  fov?: number;
  /** Shown instead of the canvas on devices that should not run WebGL. */
  fallback: ReactNode;
  /** Rendered as a full-screen backdrop inside the scene (shader quad, motes). */
  ambient?: ReactNode;
  className?: string;
  /** Shadows are cheap here (baked twice) but skippable for tiny previews. */
  shadows?: boolean;
  shadowScale?: number;
  /** Parked at rest while hidden — a peeking canvas shouldn't burn frames. */
  paused?: boolean;
};

/**
 * The single WebGL host. Owns the decisions that matter for performance:
 * pixel ratio is capped, the environment is baked once, contact shadows are
 * baked on a fixed frame count, and low-capability devices never get a context
 * at all — they receive the poster fallback from the caller.
 */
export function Stage({
  children,
  camera = [0, 0.15, 5.1],
  target = [0, -0.05, 0],
  fov = 30,
  fallback,
  ambient,
  className,
  shadows = true,
  shadowScale = 9,
  paused = false,
}: StageProps) {
  const cap = useCapability();
  const skipScene = useLoad((s) => s.skipScene);
  const renderable = canRender3D(cap);

  useEffect(() => {
    if (cap.probed && !renderable) skipScene();
  }, [cap.probed, renderable, skipScene]);

  // Before the probe resolves, hold the space silently. Rendering the poster for
  // one frame and then replacing it with 3D would read as a flash of wrongness.
  if (!cap.probed) {
    return <div className={className} aria-hidden="true" />;
  }

  if (!renderable) {
    return <div className={className}>{fallback}</div>;
  }

  const dprCap: [number, number] = cap.tier === 'high' ? [1, 2] : [1, 1.5];

  return (
    <div className={className}>
      <Canvas
        dpr={dprCap}
        camera={{ fov, position: camera, near: 0.1, far: 60 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
        }}
        // Reduced motion keeps the scene interactive but stops it animating on
        // its own: frames are only produced in response to input.
        frameloop={cap.reducedMotion || paused ? 'demand' : 'always'}
        onCreated={({ gl, camera: cam }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.02;
          cam.lookAt(target[0], target[1], target[2]);
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <StudioEnvironment />
          <ambientLight intensity={0.32} />
          <directionalLight position={[-4.5, 6, 4]} intensity={1.15} color="#fff3e2" />
          <directionalLight position={[5, 2, -3.5]} intensity={0.5} color="#c9d5e6" />

          {ambient}
          {children}

          {shadows && (
            <ContactShadows
              position={[0, FLOOR_Y + 0.002, 0]}
              scale={shadowScale}
              opacity={0.34}
              blur={2.5}
              far={4.5}
              resolution={cap.tier === 'high' ? 512 : 256}
              // Baked, then frozen: soft warm-tinted shadow under product
              frames={2}
              color="#3a2e22"
            />
          )}
        </Suspense>
        <FrameBeacon settleFrames={cap.reducedMotion} />
      </Canvas>
    </div>
  );
}
