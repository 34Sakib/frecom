'use client';

import { Environment, Lightformer } from '@react-three/drei';

/**
 * A fully procedural studio. No HDRI file is fetched — the softbox rig below is
 * rendered into a cube map in-scene at startup, which is why the site has zero
 * external asset requests and still gets real image-based reflections.
 *
 * The rig is the standard product-photography three-point setup:
 *   key    — large softbox, upper left, sets the specular sweep along a metal edge
 *   fill   — wide, cool, right, lifts the shadow side without flattening it
 *   rim    — thin bright strip behind, separates dark products from the backdrop
 *   bounce — dim warm card below, stands in for light coming back off a table
 *
 * `frames={1}` bakes the environment once: nothing here animates, so re-rendering
 * the cube map every frame would be pure cost.
 */
export function StudioEnvironment() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer
        form="rect"
        color="#fff5e8"
        intensity={2.4}
        scale={[7, 7, 1]}
        position={[-6, 5.5, 4]}
        target={[0, 0, 0]}
      />
      <Lightformer
        form="rect"
        color="#ccd5e2"
        intensity={0.75}
        scale={[9, 9, 1]}
        position={[7, 1.5, 3]}
        target={[0, 0, 0]}
      />
      <Lightformer
        form="rect"
        color="#ffdcb8"
        intensity={2.6}
        scale={[12, 1.1, 1]}
        position={[0, 4.2, -7]}
        target={[0, 0.5, 0]}
      />
      <Lightformer
        form="rect"
        color="#7d6a55"
        intensity={0.45}
        scale={[12, 12, 1]}
        position={[0, -5.5, 1]}
        target={[0, 0, 0]}
      />
      {/* Narrow vertical strip: gives machined aluminium its sharp highlight. */}
      <Lightformer
        form="rect"
        color="#ffffff"
        intensity={1.1}
        scale={[0.6, 8, 1]}
        position={[3.4, 3, 2.4]}
        target={[0, 0, 0]}
      />
    </Environment>
  );
}
