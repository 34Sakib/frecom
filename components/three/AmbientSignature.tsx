'use client';

import { AmbientLayer } from './AmbientLayer';
import { Stage } from './Stage';

/**
 * THE ABSTRACT MOMENT
 *
 * The spec asks the About page to close on a shader signature rather than a
 * photograph. That is exactly one `AmbientLayer` — a full-screen quad whose
 * fragment shader is camera-independent, so it needs no product and no framing —
 * hosted in a normal `Stage`.
 *
 * No shadows, no contact plane, no lights worth the name: the dust motes are
 * unlit points on purpose. One context, and a CSS gradient stands in for it on a
 * device that will not run a shader (see LazyScenes).
 */
export function AmbientSignature({ className }: { className?: string }) {
  return (
    <Stage
      className={className}
      camera={[0, 0, 5]}
      target={[0, 0, 0]}
      fov={35}
      shadows={false}
      ambient={false}
      // The gradient plate is owned by the caller's gate (see LazyScenes), so
      // there is nothing for the stage itself to stand in with.
      fallback={null}
    >
      <AmbientLayer intensity={1.15} motes octaves={5} />
    </Stage>
  );
}
