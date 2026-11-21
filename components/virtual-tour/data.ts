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
  /** "Exterior" or "Inside": shown in the step label */
  zone: "Exterior" | "Inside" | "Outdoors";
  src: string;
  /** point (in % of the photo) the zoom moves towards, e.g. a doorway */
  focus: [number, number];
}

const real = (id: string, title: string, zone: RealPhoto["zone"], focus: [number, number] = [50, 55]): RealPhoto => ({
  title,
  zone,
  src: `/real/${id}.webp`,
  focus,
});

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
  /** real photographs in walk-through order: zooming in moves to the next one */
  walk: RealPhoto[];
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
    position: [-30, 0, -8],
    camera: { pos: [-12, 16, 14], target: [-30, 1, -6] },
    entry: { label: "Entry", pos: [3, 1.7, 5], target: [3, 1.7, 0] },
    walk: [
      real("amora-exterior-pool", "Amora Villa", "Exterior", [44, 60]),
      real("amora-living", "Living room", "Inside", [74, 48]),
      real("amora-bedroom-1", "Bedroom", "Inside", [55, 55]),
      real("amora-bedroom-2", "Bedroom", "Inside", [28, 55]),
      real("amora-pool-sunset", "Private pool", "Outdoors", [45, 62]),
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
    images: ["/real/farmsyde-bedroom-1.webp", "/real/farmsyde-bedroom-2.webp", "/real/farmsyde-bathroom.webp"],
    position: [28, 0, -12],
    camera: { pos: [44, 16, 12], target: [26, 1, -8] },
    entry: { label: "Entry", pos: [0, 1.7, 6], target: [0, 1.7, 0] },
    walk: [
      real("farmsyde-bedroom-1", "Bedroom", "Inside", [50, 60]),
      real("farmsyde-bedroom-2", "Bedroom", "Inside", [60, 50]),
      real("farmsyde-bathroom", "Bathroom", "Inside", [50, 50]),
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
    images: ["/real/courtyard-exterior-night.webp", "/real/courtyard-courtyard.webp", "/real/courtyard-bedroom.webp", "/real/courtyard-sitout.webp"],
    position: [6, 0, -38],
    camera: { pos: [26, 18, -16], target: [6, 1, -38] },
    entry: { label: "Entry", pos: [0, 1.7, 9], target: [0, 1.7, 0] },
    walk: [
      real("courtyard-exterior-night", "Courtyard Villa", "Exterior", [52, 60]),
      real("courtyard-courtyard", "Central courtyard", "Inside", [50, 62]),
      real("courtyard-sitout", "Sit-out", "Inside", [52, 52]),
      real("courtyard-bedroom", "Bedroom with mountain view", "Inside", [30, 50]),
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
    images: ["/real/pool-2.webp", "/real/pool-1.webp", "/real/pool-3.webp"],
    position: [2, 0, 8],
    camera: { pos: [16, 11, 26], target: [2, 0, 8] },
    walk: [real("pool-2", "Swimming pool", "Outdoors", [50, 60]), real("pool-1", "Pool and mountains", "Outdoors", [55, 50]), real("pool-3", "Pool at sunset", "Outdoors")],
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
    position: [-16, 0, 22],
    camera: { pos: [-4, 9, 38], target: [-16, 1, 22] },
    walk: [real("roots-1", "Roots Cafe", "Outdoors", [55, 55])],
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
    position: [28, 0, 20],
    camera: { pos: [44, 18, 44], target: [28, 0, 20] },
    walk: [real("lawns-machan", "Machan lawn", "Outdoors"), real("lawns-tent", "Tent lawn", "Outdoors"), real("lawns-poolside", "Poolside lawn", "Outdoors")],
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
    position: [-36, 0, 28],
    camera: { pos: [-22, 13, 46], target: [-36, 0, 28] },
    walk: [real("gardens-pathway", "Garden pathway", "Outdoors", [55, 50]), real("gardens-play", "Kids play area", "Outdoors"), real("gardens-machan", "Machan", "Outdoors")],
    moreUrl: "https://touchwoodbliss.com/",
  },
];

export const getLocation = (id: string | null) => LOCATIONS.find((l) => l.id === id) ?? null;

export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
