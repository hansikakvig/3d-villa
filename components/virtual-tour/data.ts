// Content sourced from touchwoodbliss.com (/, /stay, /dining, /contact).
// Positions in the 3D scene are ILLUSTRATIVE ONLY. No surveyed masterplan or
// architectural drawings were available, so placement is approximate.

export type Vec3 = [number, number, number];

export interface Viewpoint {
  label: string;
  pos: Vec3; // offset from the location origin
  target: Vec3;
  marker?: Vec3; // where the in-scene hotspot sits (defaults to target)
}

export interface Room {
  id: string;
  name: string;
  kind: "indoor" | "outdoor";
  /** equirectangular 360° photo. Leave undefined to show the labelled placeholder. */
  pano?: string;
  palette: { wall: string; floor: string; ceiling: string; accent: string };
  links: { to: string; yaw: number; pitch?: number }[];
}

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
  rooms?: Room[];
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

const warm = { wall: "#e9dcc6", floor: "#8a6342", ceiling: "#f4ede1", accent: "#5b7a52" };
const kerala = { wall: "#efe3cf", floor: "#6b3f26", ceiling: "#7a4a2b", accent: "#a5482c" };
const farm = { wall: "#f1ece2", floor: "#a07a55", ceiling: "#faf7f0", accent: "#4f6b47" };
const out = { wall: "#bcd3b0", floor: "#5f7f4a", ceiling: "#cfe3ee", accent: "#3a6b47" };

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
    images: ["/tb/amora/amora5.webp", "/tb/amora/amora4.webp", "/tb/amora/amora2.webp"],
    position: [-30, 0, -8],
    camera: { pos: [-12, 16, 14], target: [-30, 1, -6] },
    viewpoints: [
      { label: "Overview", pos: [18, 16, 22], target: [0, 1, 2] },
      { label: "Façade", pos: [6, 3, 17], target: [0, 2, 0] },
      { label: "Private pool", pos: [-6, 2.2, 13], target: [0, 0.4, 7] },
      { label: "Garden", pos: [-17, 3, 9], target: [-8, 0.5, 2] },
    ],
    entry: { label: "Entry", pos: [3, 1.7, 5], target: [3, 1.7, 0] },
    rooms: [
      { id: "living", name: "Living Room", kind: "indoor", palette: warm, links: [{ to: "bedroom", yaw: 70 }, { to: "pool", yaw: 180 }, { to: "garden", yaw: -90 }] },
      { id: "bedroom", name: "Bedroom", kind: "indoor", palette: warm, links: [{ to: "living", yaw: -110 }, { to: "bathroom", yaw: 40 }] },
      { id: "bathroom", name: "Bathroom", kind: "indoor", palette: { ...warm, wall: "#dcd6cb" }, links: [{ to: "bedroom", yaw: 180 }] },
      { id: "garden", name: "Private Garden", kind: "outdoor", palette: out, links: [{ to: "living", yaw: 90 }, { to: "pool", yaw: 150 }] },
      { id: "pool", name: "Private Pool", kind: "outdoor", palette: { ...out, floor: "#4fa8b5" }, links: [{ to: "living", yaw: 0 }, { to: "garden", yaw: -60 }] },
    ],
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
    images: ["/tb/farmsyde/farmsyde1.webp", "/tb/farmsyde/farmsyde2.webp", "/tb/farmsyde/farmsyde3.webp"],
    position: [28, 0, -12],
    camera: { pos: [44, 16, 12], target: [26, 1, -8] },
    viewpoints: [
      { label: "Overview", pos: [22, 18, 22], target: [-2, 1, 2] },
      { label: "Verandah", pos: [2, 3, 16], target: [0, 2, 0] },
      { label: "Private pool", pos: [9, 2.4, 14], target: [-2, 0.4, 8] },
      { label: "Open lawns", pos: [-24, 3.5, 12], target: [-12, 0.5, 0] },
    ],
    entry: { label: "Entry", pos: [0, 1.7, 6], target: [0, 1.7, 0] },
    rooms: [
      { id: "living", name: "Family Living Room", kind: "indoor", palette: farm, links: [{ to: "bedroom", yaw: 90 }, { to: "verandah", yaw: 180 }] },
      { id: "bedroom", name: "Bedroom", kind: "indoor", palette: farm, links: [{ to: "living", yaw: -90 }, { to: "bathroom", yaw: 30 }] },
      { id: "bathroom", name: "Bathroom", kind: "indoor", palette: { ...farm, wall: "#e2ddd3" }, links: [{ to: "bedroom", yaw: 180 }] },
      { id: "verandah", name: "Verandah & Pool", kind: "outdoor", palette: { ...out, floor: "#4fa8b5" }, links: [{ to: "living", yaw: 0 }, { to: "lawn", yaw: -90 }] },
      { id: "lawn", name: "Open Lawn", kind: "outdoor", palette: out, links: [{ to: "verandah", yaw: 90 }] },
    ],
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
    images: ["/tb/courtyard/courtyard1.webp", "/tb/courtyard/courtyard2.webp", "/tb/courtyard/courtyard4.webp", "/tb/courtyard/courtyard3.webp"],
    position: [6, 0, -38],
    camera: { pos: [26, 18, -16], target: [6, 1, -38] },
    viewpoints: [
      { label: "Overview", pos: [20, 20, 18], target: [0, 1, -2] },
      { label: "Courtyard", pos: [0, 13, 5], target: [0, 0, 0] },
      { label: "Infinity pool & mountains", pos: [0, 3.4, -8.5], target: [0, -1, -45], marker: [0, 0.5, -12] },
      { label: "Entrance", pos: [0, 3, 19], target: [0, 2, 0] },
    ],
    entry: { label: "Entry", pos: [0, 1.7, 9], target: [0, 1.7, 0] },
    rooms: [
      { id: "courtyard", name: "Central Courtyard", kind: "outdoor", palette: { ...kerala, ceiling: "#cfe3ee", floor: "#8d7b66" }, links: [{ to: "living", yaw: 0 }, { to: "bedroom", yaw: 90 }, { to: "pool", yaw: 180 }] },
      { id: "living", name: "Living Room", kind: "indoor", palette: kerala, links: [{ to: "courtyard", yaw: 180 }] },
      { id: "bedroom", name: "Bedroom", kind: "indoor", palette: kerala, links: [{ to: "courtyard", yaw: -90 }, { to: "bathroom", yaw: 60 }] },
      { id: "bathroom", name: "Bathroom", kind: "indoor", palette: { ...kerala, ceiling: "#efe3cf" }, links: [{ to: "bedroom", yaw: 180 }] },
      { id: "pool", name: "Infinity Pool Deck", kind: "outdoor", palette: { ...out, floor: "#4fa8b5" }, links: [{ to: "courtyard", yaw: 0 }] },
    ],
    moreUrl: "https://touchwoodbliss.com/stay",
  },
  {
    id: "pool",
    name: "Swimming Pool",
    kind: "amenity",
    tagline: "Swimming pool with nature views",
    description: "The resort swimming pool, set among the greenery and mountain views of Igatpuri.",
    highlights: ["Nature views", "Open to resort guests"],
    images: ["/tb/areas/pool.webp"],
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
    images: ["/tb/areas/rootscafe.webp", "/tb/areas/dining.webp"],
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
    images: ["/tb/areas/celebrations.webp"],
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
    images: ["/tb/areas/kids.webp", "/tb/areas/outdoor.webp"],
    position: [-36, 0, 28],
    camera: { pos: [-22, 13, 46], target: [-36, 0, 28] },
    moreUrl: "https://touchwoodbliss.com/",
  },
];

export const getLocation = (id: string | null) => LOCATIONS.find((l) => l.id === id) ?? null;

export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
