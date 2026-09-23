'use client';

import * as THREE from 'three';
import { useEffect, useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import type { Finish, ProductModelKind } from '@/lib/products';
import { EASE, gsap, registerGsap } from '@/lib/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks';

/**
 * PROCEDURAL PRODUCT MODELS
 *
 * The spec assumes a compressed GLB per hero asset (2–3 MB, Draco). None were
 * supplied, so each object here is built from primitives instead of loaded.
 * Consequences, deliberately chosen:
 *   + zero network requests, so the hero paints on first frame and the loader
 *     reports real work rather than download progress
 *   + the whole catalogue is configurable at runtime (finishes tween live)
 *   - silhouettes are stylised, not photogrammetric
 *
 * Swapping in real assets later is a contained change: replace the body of
 * `ProductModel` with `<primitive object={useGLTF(src).scene} />`, keep the
 * materials hook for the variant UI, and drive `useProgress` (already wired in
 * the loader) from actual GLB downloads. See README › 3D assets.
 */

/** Ground plane height. ContactShadows is placed here by the Stage. */
export const FLOOR_Y = -1.15;

/* -------------------------------------------------------------------------- */
/*  Materials                                                                  */
/* -------------------------------------------------------------------------- */

type Mats = {
  /** The finish itself: anodised, lacquered or oiled body. */
  body: THREE.MeshPhysicalMaterial;
  /** Same colour, ceramic/low-sheen read — baffles, plinths, grilles. */
  matte: THREE.MeshStandardMaterial;
  /** Machined bright metal: trim rings, platters, knobs. */
  trim: THREE.MeshStandardMaterial;
  /** Structural black: frames, arm tubes, internal parts. */
  dark: THREE.MeshStandardMaterial;
  /** Contact surfaces: ear pads, felt feet. */
  soft: THREE.MeshStandardMaterial;
  /** Acrylic and vinyl. */
  glossy: THREE.MeshPhysicalMaterial;
  /** Indicator lamps. */
  lamp: THREE.MeshStandardMaterial;
};

function createMaterials(finish: Finish): Mats {
  return {
    body: new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(finish.hex),
      metalness: finish.metalness,
      roughness: finish.roughness,
      clearcoat: 0.4,
      clearcoatRoughness: 0.36,
      envMapIntensity: 1.15,
    }),
    matte: new THREE.MeshStandardMaterial({
      color: new THREE.Color(finish.hex),
      metalness: Math.min(finish.metalness, 0.2),
      roughness: Math.min(0.95, finish.roughness + 0.25),
      envMapIntensity: 0.85,
    }),
    trim: new THREE.MeshStandardMaterial({
      color: new THREE.Color(finish.trim),
      metalness: 0.92,
      roughness: 0.26,
      envMapIntensity: 1.4,
    }),
    dark: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#17140f'),
      metalness: 0.35,
      roughness: 0.78,
      envMapIntensity: 0.7,
    }),
    soft: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1b1815'),
      metalness: 0,
      roughness: 0.96,
      envMapIntensity: 0.5,
    }),
    glossy: new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#0a0908'),
      metalness: 0.05,
      roughness: 0.14,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      envMapIntensity: 1.3,
    }),
    lamp: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2a1a0c'),
      emissive: new THREE.Color('#e79a52'),
      emissiveIntensity: 1.6,
      roughness: 0.5,
    }),
  };
}

function matteTargets(finish: Finish) {
  return {
    metalness: Math.min(finish.metalness, 0.2),
    roughness: Math.min(0.95, finish.roughness + 0.25),
  };
}

/**
 * Materials are created once per mount and *tweened* between finishes, so a
 * variant change reads as the object being refinished rather than swapped.
 * That single detail is most of what makes the configurator feel expensive.
 */
export function useProductMaterials(finish: Finish): Mats {
  const reducedMotion = usePrefersReducedMotion();
  // Created once on purpose: stable material refs are what allow tweening below.
  const mats = useMemo(() => createMaterials(finish), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => () => {
      Object.values(mats).forEach((m) => m.dispose());
    },
    [mats],
  );

  useEffect(() => {
    const body = new THREE.Color(finish.hex);
    const trim = new THREE.Color(finish.trim);
    const matte = matteTargets(finish);

    if (reducedMotion) {
      mats.body.color.copy(body);
      mats.matte.color.copy(body);
      mats.trim.color.copy(trim);
      mats.body.metalness = finish.metalness;
      mats.body.roughness = finish.roughness;
      mats.matte.metalness = matte.metalness;
      mats.matte.roughness = matte.roughness;
      return;
    }

    registerGsap();
    const tl = gsap.timeline({ defaults: { duration: 0.72, ease: EASE } });
    tl.to([mats.body.color, mats.matte.color], { r: body.r, g: body.g, b: body.b }, 0)
      .to(mats.trim.color, { r: trim.r, g: trim.g, b: trim.b }, 0)
      .to(
        mats.body,
        { metalness: finish.metalness, roughness: finish.roughness },
        0,
      )
      .to(mats.matte, { metalness: matte.metalness, roughness: matte.roughness }, 0);

    return () => {
      tl.kill();
    };
  }, [finish, mats, reducedMotion]);

  return mats;
}

/* -------------------------------------------------------------------------- */
/*  Geometry helpers                                                           */
/* -------------------------------------------------------------------------- */

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/* -------------------------------------------------------------------------- */
/*  Aurora 01 — closed-back headphone                                          */
/* -------------------------------------------------------------------------- */

function Headphone({ m }: { m: Mats }) {
  const bandCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        v(-0.97, -0.34, 0),
        v(-0.92, 0.4, 0),
        v(-0.55, 0.9, 0),
        v(0, 1.06, 0.02),
        v(0.55, 0.9, 0),
        v(0.92, 0.4, 0),
        v(0.97, -0.34, 0),
      ]),
    [],
  );

  const padCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        v(-0.88, -0.42, 0),
        v(-0.83, 0.3, 0),
        v(-0.5, 0.76, 0),
        v(0, 0.9, 0.02),
        v(0.5, 0.76, 0),
        v(0.83, 0.3, 0),
        v(0.88, -0.42, 0),
      ]),
    [],
  );

  const cableCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        v(-1.0, -0.98, 0.02),
        v(-1.02, -1.06, 0.22),
        v(-0.72, -1.12, 0.5),
        v(-0.1, -1.15, 0.62),
        v(0.6, -1.15, 0.55),
      ]),
    [],
  );

  return (
    <group>
      <mesh>
        <tubeGeometry args={[bandCurve, 96, 0.072, 20, false]} />
        <primitive object={m.body} attach="material" />
      </mesh>
      <mesh>
        <tubeGeometry args={[padCurve, 96, 0.052, 18, false]} />
        <primitive object={m.soft} attach="material" />
      </mesh>

      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.94, -0.42, 0]}>
          {/* yoke */}
          <RoundedBox args={[0.1, 0.34, 0.1]} radius={0.03} smoothness={3}>
            <primitive object={m.trim} attach="material" />
          </RoundedBox>
        </group>
      ))}

      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[side * 1.02, -0.62, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          {/* cup shell */}
          <mesh>
            <cylinderGeometry args={[0.4, 0.395, 0.3, 56, 1, false]} />
            <primitive object={m.body} attach="material" />
          </mesh>
          {/* machined rim */}
          <mesh position={[0, 0.15, 0]}>
            <torusGeometry args={[0.4, 0.022, 12, 56]} />
            <primitive object={m.trim} attach="material" />
          </mesh>
          {/* outer face plate */}
          <mesh position={[0, side * 0.155, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.018, 48]} />
            <primitive object={m.trim} attach="material" />
          </mesh>
          {/* badge ring */}
          <mesh position={[0, side * 0.168, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.13, 0.008, 8, 40]} />
            <primitive object={m.dark} attach="material" />
          </mesh>
          {/* ear pad */}
          <mesh position={[0, side * -0.17, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.36, 0.075, 14, 48]} />
            <primitive object={m.soft} attach="material" />
          </mesh>
          {/* inner grille */}
          <mesh position={[0, side * -0.12, 0]}>
            <cylinderGeometry args={[0.33, 0.33, 0.01, 40]} />
            <primitive object={m.dark} attach="material" />
          </mesh>
        </group>
      ))}

      <mesh>
        <tubeGeometry args={[cableCurve, 80, 0.021, 10, false]} />
        <primitive object={m.dark} attach="material" />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Monolith 09 — active near-field monitor                                    */
/* -------------------------------------------------------------------------- */

function Monitor({ m }: { m: Mats }) {
  const cabinetY = FLOOR_Y + 0.9;

  return (
    <group>
      <RoundedBox
        args={[1.16, 1.78, 0.96]}
        radius={0.05}
        smoothness={4}
        position={[0, cabinetY, 0]}
      >
        <primitive object={m.matte} attach="material" />
      </RoundedBox>

      {/* ceramic baffle */}
      <RoundedBox
        args={[1.06, 1.68, 0.08]}
        radius={0.03}
        smoothness={4}
        position={[0, cabinetY, 0.47]}
      >
        <primitive object={m.matte} attach="material" />
      </RoundedBox>

      {/* woofer */}
      <group position={[0, FLOOR_Y + 0.52, 0.5]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.31, 0.13, 0.16, 48, 1, true]} />
          <primitive object={m.dark} attach="material" />
        </mesh>
        <mesh>
          <torusGeometry args={[0.31, 0.032, 12, 48]} />
          <primitive object={m.soft} attach="material" />
        </mesh>
        <mesh position={[0, 0, 0.07]}>
          <sphereGeometry args={[0.1, 24, 16]} />
          <primitive object={m.dark} attach="material" />
        </mesh>
      </group>

      {/* tweeter + waveguide */}
      <group position={[0, FLOOR_Y + 1.44, 0.48]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.07, 0.07, 40, 1, true]} />
          <primitive object={m.dark} attach="material" />
        </mesh>
        <mesh position={[0, 0, 0.035]}>
          <sphereGeometry args={[0.058, 24, 16]} />
          <primitive object={m.trim} attach="material" />
        </mesh>
      </group>

      {/* badge */}
      <RoundedBox
        args={[0.32, 0.07, 0.02]}
        radius={0.01}
        smoothness={2}
        position={[0, FLOOR_Y + 0.08, 0.52]}
      >
        <primitive object={m.trim} attach="material" />
      </RoundedBox>

      {[
        [-0.46, -0.36],
        [0.46, -0.36],
        [-0.46, 0.36],
        [0.46, 0.36],
      ].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, FLOOR_Y + 0.04, z]}>
          <cylinderGeometry args={[0.055, 0.06, 0.08, 20]} />
          <primitive object={m.dark} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Atelier T3 — belt-drive turntable                                          */
/* -------------------------------------------------------------------------- */

function Turntable({ m }: { m: Mats }) {
  const armCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        v(0.84, 0.44, -0.34),
        v(0.72, 0.5, -0.14),
        v(0.4, 0.46, 0.08),
        v(0.1, 0.4, 0.2),
        v(-0.06, 0.36, 0.24),
      ]),
    [],
  );

  const plinthY = FLOOR_Y + 0.13;

  return (
    <group>
      <RoundedBox
        args={[2.34, 0.26, 1.78]}
        radius={0.04}
        smoothness={4}
        position={[0, plinthY, 0]}
      >
        <primitive object={m.body} attach="material" />
      </RoundedBox>

      {/* platter + record */}
      <group position={[-0.28, plinthY + 0.13, -0.05]}>
        <mesh>
          <cylinderGeometry args={[0.78, 0.78, 0.1, 64]} />
          <primitive object={m.trim} attach="material" />
        </mesh>
        <mesh position={[0, 0.058, 0]}>
          <cylinderGeometry args={[0.73, 0.73, 0.014, 64]} />
          <primitive object={m.glossy} attach="material" />
        </mesh>
        <mesh position={[0, 0.068, 0]}>
          <cylinderGeometry args={[0.21, 0.21, 0.012, 40]} />
          <primitive object={m.trim} attach="material" />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.07, 12]} />
          <primitive object={m.trim} attach="material" />
        </mesh>
      </group>

      {/* tonearm */}
      <mesh position={[0.84, plinthY + 0.16, -0.34]}>
        <cylinderGeometry args={[0.1, 0.11, 0.2, 32]} />
        <primitive object={m.trim} attach="material" />
      </mesh>
      <group position={[0, plinthY, 0]}>
        <mesh>
          <tubeGeometry args={[armCurve, 64, 0.017, 10, false]} />
          <primitive object={m.trim} attach="material" />
        </mesh>
      </group>
      <RoundedBox
        args={[0.1, 0.07, 0.18]}
        radius={0.015}
        smoothness={2}
        position={[-0.08, plinthY + 0.34, 0.26]}
      >
        <primitive object={m.dark} attach="material" />
      </RoundedBox>
      <mesh
        position={[0.96, plinthY + 0.44, -0.44]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.075, 0.075, 0.14, 28]} />
        <primitive object={m.dark} attach="material" />
      </mesh>

      {[
        [-0.95, -0.62],
        [0.95, -0.62],
        [0, 0.68],
      ].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, FLOOR_Y + 0.04, z]}>
          <cylinderGeometry args={[0.09, 0.1, 0.08, 20]} />
          <primitive object={m.trim} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Vantage — class-A headphone amplifier                                      */
/* -------------------------------------------------------------------------- */

function Amplifier({ m }: { m: Mats }) {
  const y = FLOOR_Y + 0.36;

  return (
    <group>
      <RoundedBox args={[2.26, 0.64, 1.36]} radius={0.04} smoothness={4} position={[0, y, 0]}>
        <primitive object={m.matte} attach="material" />
      </RoundedBox>

      <RoundedBox
        args={[2.3, 0.52, 0.06]}
        radius={0.02}
        smoothness={3}
        position={[0, y, 0.69]}
      >
        <primitive object={m.trim} attach="material" />
      </RoundedBox>

      {/* volume knob */}
      <group position={[0.8, y, 0.74]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.19, 0.1, 40]} />
          <primitive object={m.trim} attach="material" />
        </mesh>
        <mesh position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.105, 0.105, 0.03, 32]} />
          <primitive object={m.dark} attach="material" />
        </mesh>
        <RoundedBox
          args={[0.012, 0.09, 0.012]}
          radius={0.004}
          smoothness={2}
          position={[0, 0, 0.08]}
        >
          <primitive object={m.dark} attach="material" />
        </RoundedBox>
      </group>

      {/* toggles */}
      {[-0.55, -0.38, -0.21].map((x) => (
        <RoundedBox
          key={x}
          args={[0.035, 0.1, 0.035]}
          radius={0.008}
          smoothness={2}
          position={[x, y + 0.04, 0.73]}
          rotation={[0, 0, 0.06]}
        >
          <primitive object={m.trim} attach="material" />
        </RoundedBox>
      ))}

      {/* lamps */}
      {[0.42, 0.55].map((x) => (
        <mesh key={x} position={[x, y + 0.12, 0.73]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.02, 20]} />
          <primitive object={m.lamp} attach="material" />
        </mesh>
      ))}

      {/* top vents */}
      {[-0.42, -0.21, 0, 0.21, 0.42].map((z) => (
        <RoundedBox
          key={z}
          args={[1.72, 0.014, 0.06]}
          radius={0.006}
          smoothness={2}
          position={[0, y + 0.325, z]}
        >
          <primitive object={m.dark} attach="material" />
        </RoundedBox>
      ))}

      {[
        [-0.98, -0.5],
        [0.98, -0.5],
        [-0.98, 0.5],
        [0.98, 0.5],
      ].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, FLOOR_Y + 0.035, z]}>
          <cylinderGeometry args={[0.075, 0.08, 0.07, 20]} />
          <primitive object={m.trim} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Plinth — machined headphone stand                                          */
/* -------------------------------------------------------------------------- */

function Stand({ m }: { m: Mats }) {
  const arcCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        v(-0.33, FLOOR_Y + 0.06, 0),
        v(-0.35, FLOOR_Y + 0.52, 0),
        v(-0.22, FLOOR_Y + 0.98, 0),
        v(0.06, FLOOR_Y + 1.2, 0),
        v(0.34, FLOOR_Y + 1.04, 0),
      ]),
    [],
  );

  return (
    <group>
      <mesh position={[0, FLOOR_Y + 0.028, 0]}>
        <cylinderGeometry args={[0.56, 0.58, 0.056, 56]} />
        <primitive object={m.body} attach="material" />
      </mesh>
      <mesh position={[0, FLOOR_Y + 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.014, 8, 56]} />
        <primitive object={m.trim} attach="material" />
      </mesh>
      <mesh position={[0, FLOOR_Y + 0.01, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.02, 48]} />
        <primitive object={m.soft} attach="material" />
      </mesh>
      <mesh>
        <tubeGeometry args={[arcCurve, 72, 0.078, 18, false]} />
        <primitive object={m.body} attach="material" />
      </mesh>
      <mesh position={[0.06, FLOOR_Y + 1.24, 0]} rotation={[0, 0, -0.32]}>
        <torusGeometry args={[0.17, 0.048, 12, 40]} />
        <primitive object={m.soft} attach="material" />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Halo — 360° portable speaker                                               */
/* -------------------------------------------------------------------------- */

function Portable({ m }: { m: Mats }) {
  const grille = useMemo(() => {
    const cols = 20;
    const rows = 8;
    const geo = new THREE.BoxGeometry(0.05, 0.05, 0.016);
    const mesh = new THREE.InstancedMesh(geo, m.dark, cols * rows);
    const dummy = new THREE.Object3D();
    let i = 0;
    for (let c = 0; c < cols; c++) {
      const a = (c / cols) * Math.PI * 2;
      for (let r = 0; r < rows; r++) {
        dummy.position.set(Math.sin(a) * 0.505, FLOOR_Y + 0.22 + r * 0.13, Math.cos(a) * 0.505);
        dummy.rotation.set(0, a, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i++, dummy.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = false;
    return mesh;
  }, [m.dark]);

  useEffect(
    () => () => {
      grille.geometry.dispose();
    },
    [grille],
  );

  return (
    <group>
      <mesh position={[0, FLOOR_Y + 0.815, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 1.5, 64, 1, false]} />
        <primitive object={m.body} attach="material" />
      </mesh>
      <primitive object={grille} />
      <mesh position={[0, FLOOR_Y + 1.6, 0]}>
        <cylinderGeometry args={[0.53, 0.5, 0.1, 64]} />
        <primitive object={m.trim} attach="material" />
      </mesh>
      <mesh position={[0, FLOOR_Y + 0.05, 0]}>
        <cylinderGeometry args={[0.5, 0.53, 0.1, 64]} />
        <primitive object={m.trim} attach="material" />
      </mesh>
      <mesh position={[0, FLOOR_Y + 1.655, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.23, 0.022, 10, 48]} />
        <primitive object={m.trim} attach="material" />
      </mesh>
      <mesh position={[0.06, FLOOR_Y + 1.66, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.02, 20]} />
        <primitive object={m.lamp} attach="material" />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                 */
/* -------------------------------------------------------------------------- */

export function ProductModel({
  kind,
  finish,
}: {
  kind: ProductModelKind;
  finish: Finish;
}) {
  const m = useProductMaterials(finish);

  switch (kind) {
    case 'headphone':
      return <Headphone m={m} />;
    case 'monitor':
      return <Monitor m={m} />;
    case 'turntable':
      return <Turntable m={m} />;
    case 'amplifier':
      return <Amplifier m={m} />;
    case 'stand':
      return <Stand m={m} />;
    case 'portable':
      return <Portable m={m} />;
  }
}

/** Camera framing per model — each object needs its own distance and pivot. */
export const FRAMING: Record<
  ProductModelKind,
  { camera: [number, number, number]; target: [number, number, number]; fov: number }
> = {
  headphone: { camera: [0, 0.15, 5.1], target: [0, -0.05, 0], fov: 30 },
  monitor: { camera: [1.5, 0.5, 4.6], target: [0, 0.1, 0], fov: 30 },
  turntable: { camera: [1.2, 1.6, 4.4], target: [0, -0.25, 0], fov: 30 },
  // Targets sit at each object's true vertical centre, not at the origin: the
  // amplifier, stand and portable all hang below y=0, so pivoting on the origin
  // framed them bottom-heavy and cropped the stand's base.
  amplifier: { camera: [1.4, 1.0, 4.2], target: [0, -0.4, 0], fov: 30 },
  stand: { camera: [0.2, 0.3, 4.2], target: [0, -0.35, 0], fov: 30 },
  portable: { camera: [0.6, 0.4, 4.5], target: [0, -0.25, 0], fov: 30 },
};
