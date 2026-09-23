/**
 * Build-time product catalogue.
 *
 * A static export has no runtime data source, so the catalogue is authored here
 * and inlined into the bundle at build time. Every route is pre-rendered from
 * this array via generateStaticParams — no fetch, no API route.
 *
 * To move this to a CMS or Shopify Storefront API later, replace this module with
 * a build-time fetch that returns the same `Product[]` shape. Nothing downstream
 * needs to change.
 */

export type ProductModelKind =
  | 'headphone'
  | 'monitor'
  | 'turntable'
  | 'amplifier'
  | 'stand'
  | 'portable';

export type Finish = {
  id: string;
  name: string;
  /** Body colour, also used for the swatch in the UI. */
  hex: string;
  /** Secondary tone for trim, yoke, platter or grille. */
  trim: string;
  metalness: number;
  roughness: number;
  note: string;
};

export type Beat = {
  id: string;
  /** Short technical label, rendered in the tracked mono voice. */
  label: string;
  title: string;
  body: string;
};

export type Product = {
  slug: string;
  name: string;
  /** House code shown alongside the name, e.g. "FR—01". */
  code: string;
  category: string;
  categoryId: string;
  tagline: string;
  lede: string;
  body: string[];
  priceCents: number;
  currency: 'USD';
  model: ProductModelKind;
  year: number;
  edition: string;
  featured: boolean;
  isNew: boolean;
  /** Lower number sorts first in "as designed" order. */
  order: number;
  finishes: Finish[];
  specs: { label: string; value: string }[];
  includes: string[];
  beats: Beat[];
  /** Poster fallback colours for devices without WebGL. */
  poster: [string, string];
};

const ANODIZED = { metalness: 0.86, roughness: 0.34 } as const;
const ANODIZED_SOFT = { metalness: 0.72, roughness: 0.46 } as const;
const LACQUER = { metalness: 0.28, roughness: 0.3 } as const;
const CERAMIC = { metalness: 0.06, roughness: 0.72 } as const;

export const products: Product[] = [
  {
    slug: 'aurora-01',
    name: 'Aurora 01',
    code: 'FR—01',
    category: 'Headphones',
    categoryId: 'headphones',
    tagline: 'Closed-back reference headphone',
    lede:
      'A closed-back reference headphone, cut from a single billet of aluminium and finished by hand over eleven days.',
    body: [
      'The ear cup is milled in one operation, so the driver sits in a chamber with no seams to resonate. Inside, a 45 mm beryllium-coated diaphragm is suspended on a vented surround that keeps travel linear past 100 dB.',
      'Weight is deliberately kept at 328 grams. The headband spreads load across a 42 mm contact band, which is the difference between a headphone you audition with and one you wear for a full session.',
    ],
    priceCents: 124000,
    currency: 'USD',
    model: 'headphone',
    year: 2024,
    edition: 'Continuous production',
    featured: true,
    isNew: false,
    order: 1,
    finishes: [
      {
        id: 'graphite',
        name: 'Graphite',
        hex: '#2b2a28',
        trim: '#8d857a',
        ...ANODIZED,
        note: 'Bead-blasted, hard-anodised aluminium',
      },
      {
        id: 'bone',
        name: 'Bone',
        hex: '#ded5c8',
        trim: '#a89c8c',
        ...ANODIZED_SOFT,
        note: 'Ceramic-coated aluminium, satin',
      },
      {
        id: 'oxide',
        name: 'Copper Oxide',
        hex: '#9b6636',
        trim: '#6d452a',
        metalness: 0.9,
        roughness: 0.42,
        note: 'Hand-oxidised copper, waxed',
      },
    ],
    specs: [
      { label: 'Driver', value: '45 mm beryllium-coated dynamic' },
      { label: 'Impedance', value: '32 Ω' },
      { label: 'Response', value: '5 Hz – 40 kHz' },
      { label: 'Sensitivity', value: '104 dB / 1 mW' },
      { label: 'Weight', value: '328 g' },
      { label: 'Cable', value: '1.4 m braided, 3.5 mm + 6.35 mm' },
    ],
    includes: [
      'Rigid travel case, wool-lined',
      'Two braided cables — 1.4 m and 3 m',
      '6.35 mm adaptor, machined',
      'Cotton service cloth',
    ],
    beats: [
      {
        id: 'chamber',
        label: '01 / Chamber',
        title: 'One billet, no seams',
        body: 'The cup is milled in a single pass. With no joint to vibrate, the chamber stops colouring the low midrange — the part of the spectrum that makes a closed headphone sound shut in.',
      },
      {
        id: 'band',
        label: '02 / Load',
        title: '328 grams, spread wide',
        body: 'A 42 mm contact band distributes weight across the crown rather than two pressure points. Ten hours in, you stop noticing the headphone is there.',
      },
      {
        id: 'voice',
        label: '03 / Voice coil',
        title: 'Beryllium, kept linear',
        body: 'The coated diaphragm runs on a vented surround. Even at high level the coil stays inside its linear travel, so transient edges hold their shape instead of smearing.',
      },
    ],
    poster: ['#2f2c28', '#0d0b09'],
  },
  {
    slug: 'monolith-09',
    name: 'Monolith 09',
    code: 'FR—09',
    category: 'Loudspeakers',
    categoryId: 'loudspeakers',
    tagline: 'Active near-field monitor',
    lede:
      'A two-way active monitor with a hand-cast ceramic baffle, built for rooms where the walls are close and the desk is small.',
    body: [
      'Ceramic was chosen for the baffle because it is stiff without being heavy: the baffle contributes almost nothing to the sound and nothing at all to the cabinet resonance budget.',
      'Each cabinet is bi-amplified with 90 W of class-D per driver, crossed at 1.8 kHz with a fourth-order Linkwitz–Riley. The rear panel carries trim for boundary and desk reflection.',
    ],
    priceCents: 218000,
    currency: 'USD',
    model: 'monitor',
    year: 2025,
    edition: 'Pair',
    featured: true,
    isNew: true,
    order: 2,
    finishes: [
      {
        id: 'basalt',
        name: 'Basalt',
        hex: '#26241f',
        trim: '#4a453d',
        ...LACQUER,
        note: 'Matte lacquer, ceramic baffle',
      },
      {
        id: 'bone',
        name: 'Bone',
        hex: '#e0d8cb',
        trim: '#8d857a',
        ...CERAMIC,
        note: 'Raw ceramic, unglazed',
      },
      {
        id: 'copper',
        name: 'Copper',
        hex: '#8f5c32',
        trim: '#2b2a28',
        metalness: 0.78,
        roughness: 0.38,
        note: 'Anodised copper baffle, black lacquer',
      },
    ],
    specs: [
      { label: 'Woofer', value: '170 mm coated paper' },
      { label: 'Tweeter', value: '28 mm silk dome, waveguide' },
      { label: 'Amplifier', value: '2 × 90 W class-D' },
      { label: 'Response', value: '38 Hz – 32 kHz (±3 dB)' },
      { label: 'Crossover', value: '1.8 kHz, LR4' },
      { label: 'Weight', value: '9.4 kg each' },
    ],
    includes: [
      'Isolation feet, sorbothane',
      'IEC power cable, shielded',
      'Boundary compensation card',
      'Individual frequency plot',
    ],
    beats: [
      {
        id: 'baffle',
        label: '01 / Baffle',
        title: 'Cast, then left alone',
        body: 'The baffle is cast ceramic, ground flat, and left unglazed on the inside face. Drive units bolt into a surface that will not flex under excursion.',
      },
      {
        id: 'waveguide',
        label: '02 / Waveguide',
        title: 'Directivity set at 1.8 kHz',
        body: 'A shallow waveguide brings the tweeter down to meet the woofer in dispersion, not just in level. Off-axis response stays intact, so the desk position matters less.',
      },
      {
        id: 'trim',
        label: '03 / Boundary',
        title: 'Two switches, honestly labelled',
        body: 'Desk reflection and wall boundary each get a switch and a small dedicated filter. Correction is applied where the problem is, not across the whole band.',
      },
    ],
    poster: ['#2b2836', '#0d0b09'],
  },
  {
    slug: 'atelier-t3',
    name: 'Atelier T3',
    code: 'FR—T3',
    category: 'Analogue',
    categoryId: 'analogue',
    tagline: 'Belt-drive turntable, unipivot arm',
    lede:
      'A belt-drive turntable built around a 6.4 kg alloy platter and a nine-inch unipivot arm, in a plinth you can choose in walnut, ash or basalt.',
    body: [
      'Mass is the cheapest form of silence. The platter carries its weight in the rim, so speed stability comes from inertia rather than from the motor working harder.',
      'The arm is a single point of contact: a hardened steel pivot resting in a sapphire cup. Fewer interfaces means fewer places for energy to reflect back into the cartridge.',
    ],
    priceCents: 340000,
    currency: 'USD',
    model: 'turntable',
    year: 2023,
    edition: 'Built to order, 6–8 weeks',
    featured: true,
    isNew: false,
    order: 3,
    finishes: [
      {
        id: 'walnut',
        name: 'Walnut',
        hex: '#4a3423',
        trim: '#b9b1a5',
        metalness: 0.1,
        roughness: 0.62,
        note: 'Solid walnut, oiled by hand',
      },
      {
        id: 'ash',
        name: 'Pale Ash',
        hex: '#b6a487',
        trim: '#8d857a',
        metalness: 0.1,
        roughness: 0.66,
        note: 'Solid ash, soap-finished',
      },
      {
        id: 'basalt',
        name: 'Basalt',
        hex: '#232120',
        trim: '#9a9086',
        metalness: 0.14,
        roughness: 0.7,
        note: 'Basalt composite, honed',
      },
    ],
    specs: [
      { label: 'Platter', value: '6.4 kg machined alloy, rim-weighted' },
      { label: 'Drive', value: 'Belt, 24 V synchronous' },
      { label: 'Speeds', value: '33⅓ / 45 rpm, electronic' },
      { label: 'Arm', value: '9″ unipivot, sapphire cup' },
      { label: 'Cartridge', value: 'Moving coil, 0.4 mV' },
      { label: 'Weight', value: '14.2 kg' },
    ],
    includes: [
      'Machined record clamp',
      'Dust cover, anti-static acrylic',
      'Alignment protractor, aluminium',
      'Cartridge set up at the bench',
    ],
    beats: [
      {
        id: 'platter',
        label: '01 / Platter',
        title: 'Inertia, held at the rim',
        body: 'Weight sits as far from the bearing as the geometry allows. The motor then only has to correct, not to carry — a quieter job, and an audibly quieter one.',
      },
      {
        id: 'bearing',
        label: '02 / Bearing',
        title: 'One interface, not three',
        body: 'A hardened steel point rests in a sapphire cup. The arm pivots on a single contact, so reflected energy has nowhere to accumulate.',
      },
      {
        id: 'plinth',
        label: '03 / Plinth',
        title: 'Damped where it counts',
        body: 'The plinth is laminated in three directions and loaded with a constrained layer. Knock on it — you get a dull thud, not a note.',
      },
    ],
    poster: ['#3a2c20', '#0d0b09'],
  },
  {
    slug: 'vantage',
    name: 'Vantage',
    code: 'FR—A2',
    category: 'Electronics',
    categoryId: 'electronics',
    tagline: 'Discrete class-A headphone amplifier',
    lede:
      'A fully discrete class-A headphone amplifier with transformer-coupled outputs — enough current to drive planars without the usual excuses.',
    body: [
      'Class-A means the output devices never switch off. It costs efficiency and heat; it buys the absence of crossover distortion, which is the single most audible thing a headphone amplifier can add.',
      'Output transformers are hand-wound in pairs and matched to within 0.1 dB. There is no op-amp anywhere in the signal path.',
    ],
    priceCents: 145000,
    currency: 'USD',
    model: 'amplifier',
    year: 2024,
    edition: 'Continuous production',
    featured: false,
    isNew: false,
    order: 4,
    finishes: [
      {
        id: 'basalt',
        name: 'Basalt',
        hex: '#25231f',
        trim: '#c0763e',
        metalness: 0.6,
        roughness: 0.42,
        note: 'Powder-coated steel, copper fascia',
      },
      {
        id: 'copper',
        name: 'Copper',
        hex: '#9a6236',
        trim: '#26241f',
        metalness: 0.84,
        roughness: 0.36,
        note: 'Anodised copper, black steel',
      },
    ],
    specs: [
      { label: 'Topology', value: 'Discrete class-A, transformer-coupled' },
      { label: 'Output', value: '2 W into 32 Ω' },
      { label: 'THD + N', value: '0.0012 % @ 1 kHz' },
      { label: 'Inputs', value: 'XLR balanced / RCA' },
      { label: 'Gain', value: '0 / 12 / 24 dB, relay' },
      { label: 'Weight', value: '6.8 kg' },
    ],
    includes: [
      'Power supply, external and regulated',
      'Matched output transformers (pair)',
      'Aluminium remote, machined',
      'Four feet, cork and alloy',
    ],
    beats: [
      {
        id: 'classa',
        label: '01 / Bias',
        title: 'Never switching off',
        body: 'The output stage idles at full current. Nothing crosses over, so there is no crossover distortion to hear — only a warm chassis and a stable image.',
      },
      {
        id: 'iron',
        label: '02 / Iron',
        title: 'Hand-wound, then matched',
        body: 'Output transformers are wound in pairs on the same jig and matched to 0.1 dB. Pairing is what keeps the centre image from drifting between channels.',
      },
      {
        id: 'supply',
        label: '03 / Supply',
        title: 'Regulation kept outside',
        body: 'The supply lives in its own chassis so that transformer vibration never reaches the gain stage. Tidy on the shelf is a side effect, not the point.',
      },
    ],
    poster: ['#2a2622', '#0d0b09'],
  },
  {
    slug: 'plinth-stand',
    name: 'Plinth',
    code: 'FR—S1',
    category: 'Objects',
    categoryId: 'objects',
    tagline: 'Machined headphone stand',
    lede:
      'A single piece of machined 6061 aluminium with a cold-rolled steel core, so it stays where you put it.',
    body: [
      'The arc is milled from solid stock rather than bent from tube, which is why the curve holds its radius exactly and the surface has no stretch marks.',
      'A steel core brings the base to 1.9 kg. Lifting the headphone off it should feel like lifting it off a table, not off a stick.',
    ],
    priceCents: 26000,
    currency: 'USD',
    model: 'stand',
    year: 2023,
    edition: 'Continuous production',
    featured: false,
    isNew: false,
    order: 5,
    finishes: [
      {
        id: 'graphite',
        name: 'Graphite',
        hex: '#2d2b28',
        trim: '#8d857a',
        ...ANODIZED,
        note: 'Hard-anodised 6061',
      },
      {
        id: 'bone',
        name: 'Bone',
        hex: '#ddd4c7',
        trim: '#a89c8c',
        ...ANODIZED_SOFT,
        note: 'Satin ceramic coat',
      },
      {
        id: 'oxide',
        name: 'Copper Oxide',
        hex: '#96602f',
        trim: '#5f3c23',
        metalness: 0.88,
        roughness: 0.44,
        note: 'Oxidised copper wrap',
      },
    ],
    specs: [
      { label: 'Material', value: '6061 aluminium, machined' },
      { label: 'Core', value: 'Cold-rolled steel, 1.1 kg' },
      { label: 'Base', value: 'Ø 110 mm, felt-bottomed' },
      { label: 'Height', value: '268 mm' },
      { label: 'Weight', value: '1.9 kg' },
      { label: 'Finish', value: 'Anodised or ceramic-coated' },
    ],
    includes: ['Felt base pad, wool', 'Cotton storage sleeve'],
    beats: [
      {
        id: 'arc',
        label: '01 / Arc',
        title: 'Milled, never bent',
        body: 'Bending tube stretches the outer wall and thins it. Milling the arc from solid keeps the wall constant and the radius exact.',
      },
      {
        id: 'core',
        label: '02 / Core',
        title: 'Weight where you need it',
        body: 'The steel core sits low in the base. The stand resists a one-handed lift, which is the only test that matters day to day.',
      },
      {
        id: 'contact',
        label: '03 / Contact',
        title: 'Nothing scratches',
        body: 'A wool felt pad isolates the base and the cradle. No metal touches the headphone, and no metal touches your desk.',
      },
    ],
    poster: ['#2d2b28', '#0d0b09'],
  },
  {
    slug: 'halo',
    name: 'Halo',
    code: 'FR—P4',
    category: 'Loudspeakers',
    categoryId: 'loudspeakers',
    tagline: 'Portable 360° speaker',
    lede:
      'A portable speaker milled from one aluminium tube, radiating in every direction so the room never has a bad seat.',
    body: [
      'Three full-range drivers are arranged in a ring and fed a shared signal with progressive delay, which is what turns three cones into one 360° source.',
      'The tube is a single extrusion, closed at both ends with machined caps. At 1.2 kg, it is heavy enough to feel deliberate and light enough to carry.',
    ],
    priceCents: 68000,
    currency: 'USD',
    model: 'portable',
    year: 2025,
    edition: 'Continuous production',
    featured: false,
    isNew: true,
    order: 6,
    finishes: [
      {
        id: 'graphite',
        name: 'Graphite',
        hex: '#2a2825',
        trim: '#1a1816',
        ...ANODIZED,
        note: 'Anodised tube, acoustic mesh',
      },
      {
        id: 'bone',
        name: 'Bone',
        hex: '#ded6c9',
        trim: '#b9b1a5',
        ...ANODIZED_SOFT,
        note: 'Ceramic-coated, bone mesh',
      },
      {
        id: 'oxide',
        name: 'Copper Oxide',
        hex: '#9d6533',
        trim: '#6b4326',
        metalness: 0.8,
        roughness: 0.4,
        note: 'Oxidised copper, graphite mesh',
      },
    ],
    specs: [
      { label: 'Drivers', value: '3 × 48 mm full range' },
      { label: 'Battery', value: '18 h, USB-C PD' },
      { label: 'Ingress', value: 'IP54' },
      { label: 'Wireless', value: 'Bluetooth 5.3, aptX Lossless' },
      { label: 'Weight', value: '1.2 kg' },
      { label: 'Body', value: 'Extruded aluminium, machined caps' },
    ],
    includes: [
      'USB-C cable, braided',
      'Woven carry case',
      'Quick start card, letterpress',
    ],
    beats: [
      {
        id: 'ring',
        label: '01 / Ring',
        title: 'Three cones, one source',
        body: 'Progressive delay across the driver ring means the three cones behave as a single radiator. Walk around the table and the image stays put.',
      },
      {
        id: 'tube',
        label: '02 / Tube',
        title: 'Extruded, then closed',
        body: 'Aluminium extrusion gives a seamless wall with no seam to buzz. Machined end caps close it and carry the passive radiators.',
      },
      {
        id: 'power',
        label: '03 / Power',
        title: 'Eighteen honest hours',
        body: 'Measured at a real listening level, not at a whisper. USB-C PD tops it back to full in ninety minutes.',
      },
    ],
    poster: ['#33302b', '#0d0b09'],
  },
];

export const categories = [
  { id: 'all', name: 'All objects' },
  { id: 'headphones', name: 'Headphones' },
  { id: 'loudspeakers', name: 'Loudspeakers' },
  { id: 'analogue', name: 'Analogue' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'objects', name: 'Objects' },
] as const;

export type SortId = 'designed' | 'price-asc' | 'price-desc' | 'newest';

export const sorts: { id: SortId; name: string }[] = [
  { id: 'designed', name: 'As designed' },
  { id: 'newest', name: 'Most recent' },
  { id: 'price-asc', name: 'Price, ascending' },
  { id: 'price-desc', name: 'Price, descending' },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function sortProducts(list: Product[], sort: SortId): Product[] {
  const copy = [...list];
  switch (sort) {
    case 'price-asc':
      return copy.sort((a, b) => a.priceCents - b.priceCents);
    case 'price-desc':
      return copy.sort((a, b) => b.priceCents - a.priceCents);
    case 'newest':
      return copy.sort((a, b) => b.year - a.year || a.order - b.order);
    default:
      return copy.sort((a, b) => a.order - b.order);
  }
}

export function getFinish(product: Product, finishId?: string): Finish {
  return product.finishes.find((f) => f.id === finishId) ?? product.finishes[0];
}
