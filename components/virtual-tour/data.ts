// Content and photographs sourced from touchwoodbliss.com (/, /stay, /dining, /contact, /venues, /gallery).
// Positions in the 3D scene are ILLUSTRATIVE ONLY. No surveyed masterplan or
// architectural drawings were available, so placement is approximate.

export type Vec3 = [number, number, number];

export interface Viewpoint {
  label: string;
  pos: Vec3; // offset from the location origin
  target: Vec3;
  marker?: Vec3; // where the in-scene hotspot sits (defaults to target)
}

/** A real photograph from touchwoodbliss.com plus its generated depth map. */
export interface RealPhoto {
  title: string;
  src: string;
  depth: string;
}

const real = (id: string, title: string): RealPhoto => ({ title, src: `/real/${id}.webp`, depth: `/real/${id}-depth.webp` });

export interface Location {
  id: string;
  name: string;
  kind: "villa" | "amenity";
  tagline: string;
  description: string;
  highlights: string[];
  images: string[];
  position: Vec3;
  camera: { pos: Vec3; target: Vec3 }; // absolute
  viewpoints?: Viewpoint[]; // villas only, first = overview
  entry?: Viewpoint; // villas: camera path into the door
  /** real exterior / outdoor photos (villas) or area photos (amenities) */
  outsidePhotos: RealPhoto[];
  /** real interior photos (villas) */
  insidePhotos?: RealPhoto[];
  moreUrl: string;
}

export const CONTACT = {
  bookingUrl: "https://live.ipms247.com/booking/book-rooms-touchwoodbliss",
  contactUrl: "https://touchwoodbliss.com/contact",
  email: "reservations@touchwoodbliss.com",
  phones: [
    { label: "Website & OTA bookings", number: "+91 7030007581" },
    { label: "Leisure stay", number: "+91 7030666444" },
    { label: "Leisure stay", number: "+91 7030060422" },
    { label: "Weddings & celebrations", number: "+91 7030060622" },
    { label: "Membership booking", number: "+91 7030666222" },
  ],
  address: "Bhavali Dam Road, Bhagatwadi, Igatpuri, Nashik, Maharashtra 422403",
};

export const LOCATIONS: Location[] = [
  {
    id: "amora",
    name: "Amora Villa",
    kind: "villa",
    tagline: "India's 1st and only biophilic villa",
    description:
      "A biophilic villa designed to reconnect guests with nature, with its own private pool and a private garden with serene views.",
    highlights: [
      "Private pool access",
      "Private garden space with serene views",
      "Interiors designed with natural elements",
      "Perfect for couples and intimate family stays",
    ],
    images: ["/real/amora-exterior-pool.webp", "/real/amora-living.webp", "/real/amora-bedroom-1.webp", "/real/amora-pool-sunset.webp"],
    outsidePhotos: [
      real("amora-exterior-pool", "Villa and pool"),
      real("amora-exterior-dusk", "Villa at dusk"),
      real("amora-pool-sunset", "Pool at sunset"),
      real("amora-outdoor", "Outdoor space"),
    ],
    insidePhotos: [
      real("amora-living", "Living room"),
      real("amora-bedroom-1", "Bedroom · view 1"),
      real("amora-bedroom-2", "Bedroom · view 2"),
      real("amora-bedroom-3", "Bedroom · view 3"),
    ],
    position: [-30, 0, -8],
    camera: { pos: [-12, 16, 14], target: [-30, 1, -6] },
    viewpoints: [
      { label: "Overview", pos: [18, 16, 22], target: [0, 1, 2] },
      { label: "Façade", pos: [6, 3, 17], target: [0, 2, 0] },
      { label: "Private pool", pos: [-6, 2.2, 13], target: [0, 0.4, 7] },
      { label: "Garden", pos: [-17, 3, 9], target: [-8, 0.5, 2] },
    ],
    entry: { label: "Entry", pos: [3, 1.7, 5], target: [3, 1.7, 0] },
    moreUrl: "https://touchwoodbliss.com/stay",
  },
  {
    id: "farmsyde",
    name: "Farmsyde Villa",
    kind: "villa",
    tagline: "Slow down and spend real time with your family",
    description:
      "A family villa with a private pool and open spaces around it, ideal for families and group getaways.",
    highlights: [
      "Private pool",
      "Open spaces for connection",
      "Spacious, comfortable stay",
      "Ideal for families and group getaways",
    ],
    images: ["/real/farmsyde-bedroom-1.webp", "/real/farmsyde-bedroom-2.webp", "/real/farmsyde-bathroom.webp"],
    outsidePhotos: [],
    insidePhotos: [
      real("farmsyde-bedroom-1", "Bedroom · view 1"),
      real("farmsyde-bedroom-2", "Bedroom · view 2"),
      real("farmsyde-bathroom", "Bathroom"),
    ],
    position: [28, 0, -12],
    camera: { pos: [44, 16, 12], target: [26, 1, -8] },
    viewpoints: [
      { label: "Overview", pos: [22, 18, 22], target: [-2, 1, 2] },
      { label: "Verandah", pos: [2, 3, 16], target: [0, 2, 0] },
      { label: "Private pool", pos: [9, 2.4, 14], target: [-2, 0.4, 8] },
      { label: "Open lawns", pos: [-24, 3.5, 12], target: [-12, 0.5, 0] },
    ],
    entry: { label: "Entry", pos: [0, 1.7, 6], target: [0, 1.7, 0] },
    moreUrl: "https://touchwoodbliss.com/stay",
  },
  {
    id: "courtyard",
    name: "Courtyard Villa",
    kind: "villa",
    tagline: "The soul of Kerala living",
    description:
      "A Kerala-inspired villa built around a courtyard, with an infinity pool facing the mountains.",
    highlights: [
      "Infinity pool with scenic mountain views",
      "Nature-inspired living",
      "Perfect for relaxation and leisure",
      "Ideal for shared moments",
    ],
    images: ["/real/courtyard-exterior-night.webp", "/real/courtyard-courtyard.webp", "/real/courtyard-bedroom.webp", "/real/courtyard-sitout.webp"],
    outsidePhotos: [
      real("courtyard-exterior-night", "Villa at night"),
      real("courtyard-courtyard", "Central courtyard"),
    ],
    insidePhotos: [
      real("courtyard-bedroom", "Bedroom with mountain view"),
      real("courtyard-sitout", "Sit-out and room"),
    ],
    position: [6, 0, -38],
    camera: { pos: [26, 18, -16], target: [6, 1, -38] },
    viewpoints: [
      { label: "Overview", pos: [20, 20, 18], target: [0, 1, -2] },
      { label: "Courtyard", pos: [0, 13, 5], target: [0, 0, 0] },
      { label: "Infinity pool & mountains", pos: [0, 3.4, -8.5], target: [0, -1, -45], marker: [0, 0.5, -12] },
      { label: "Entrance", pos: [0, 3, 19], target: [0, 2, 0] },
    ],
    entry: { label: "Entry", pos: [0, 1.7, 9], target: [0, 1.7, 0] },
    moreUrl: "https://touchwoodbliss.com/stay",
  },
  {
    id: "pool",
    name: "Swimming Pool",
    kind: "amenity",
    tagline: "Swimming pool with nature views",
    description: "The resort swimming pool, set among the greenery and mountain views of Igatpuri.",
    highlights: ["Nature views", "Open to resort guests"],
    images: ["/real/pool-2.webp", "/real/pool-1.webp", "/real/pool-3.webp"],
    outsidePhotos: [real("pool-2", "Swimming pool"), real("pool-1", "Pool and mountains"), real("pool-3", "Pool at sunset")],
    position: [2, 0, 8],
    camera: { pos: [16, 11, 26], target: [2, 0, 8] },
    moreUrl: "https://touchwoodbliss.com/stay",
  },
  {
    id: "roots",
    name: "Roots Cafe & Nature Lounge",
    kind: "amenity",
    tagline: "Slow evenings at Roots Cafe",
    description:
      "The resort's cafe and nature lounge. Touchwood Bliss is a fully pure veg resort, with Jain meals on request.",
    highlights: ["Pure veg & Jain dining", "Nature lounge"],
    images: ["/real/roots-1.webp"],
    outsidePhotos: [real("roots-1", "Roots Cafe")],
    position: [-16, 0, 22],
    camera: { pos: [-4, 9, 38], target: [-16, 1, 22] },
    moreUrl: "https://touchwoodbliss.com/dining",
  },
  {
    id: "lawns",
    name: "Lawns & Celebration Spaces",
    kind: "amenity",
    tagline: "Seven lawns and indoor venues for up to 800 guests",
    description: "Spacious lawns for weddings, celebrations and gatherings, set against the Western Ghats.",
    highlights: ["Spacious lawns for celebrations", "Lawns and indoor venues for up to 800 guests"],
    images: ["/real/lawns-machan.webp", "/real/lawns-tent.webp", "/real/lawns-poolside.webp"],
    outsidePhotos: [real("lawns-machan", "Machan lawn"), real("lawns-tent", "Tent lawn"), real("lawns-poolside", "Poolside lawn")],
    position: [28, 0, 20],
    camera: { pos: [44, 18, 44], target: [28, 0, 20] },
    moreUrl: "https://touchwoodblissweddings.com",
  },
  {
    id: "gardens",
    name: "Gardens & Activity Areas",
    kind: "amenity",
    tagline: "Play, games and evenings by the bonfire",
    description: "Green spaces for families, with a kids play area, indoor and outdoor games and bonfire evenings.",
    highlights: ["Kids play area & family zones", "Indoor & outdoor games", "Bonfire & evening experiences", "Pet-friendly stays"],
    images: ["/real/gardens-play.webp", "/real/gardens-pathway.webp", "/real/gardens-machan.webp"],
    outsidePhotos: [real("gardens-play", "Kids play area"), real("gardens-pathway", "Garden pathway"), real("gardens-machan", "Machan")],
    position: [-36, 0, 28],
    camera: { pos: [-22, 13, 46], target: [-36, 0, 28] },
    moreUrl: "https://touchwoodbliss.com/",
  },
];

/** Whole-resort real photo set, including the official drone shot. */
export const RESORT_PHOTOS: RealPhoto[] = [
  real("resort-aerial", "Aerial view of the resort"),
  real("amora-exterior-pool", "Amora Villa"),
  real("courtyard-courtyard", "Courtyard Villa"),
  real("pool-2", "Swimming pool"),
  real("roots-1", "Roots Cafe"),
  real("lawns-machan", "Machan lawn"),
  real("gardens-pathway", "Garden pathway"),
];

export const getLocation = (id: string | null) => LOCATIONS.find((l) => l.id === id) ?? null;

export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
