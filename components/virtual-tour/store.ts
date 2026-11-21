import { create } from "zustand";

export type Mode = "loading" | "intro" | "aerial" | "location" | "villa" | "entering" | "interior";

interface TourState {
  mode: Mode;
  selected: string | null;
  hovered: string | null;
  viewpoint: number;
  room: string | null;
  enquiryFor: string | null;
  enquiryOpen: boolean;
  reducedMotion: boolean;
  /** real-photo 3D tour overlay: a location id (or "resort") and which photo set */
  photoTour: { id: string; set: "inside" | "outside" } | null;
  setMode: (m: Mode) => void;
  start: () => void;
  select: (id: string) => void;
  hover: (id: string | null) => void;
  enterVilla: (id: string) => void;
  setViewpoint: (i: number) => void;
  enterInterior: () => void;
  setRoom: (id: string) => void;
  exitInterior: () => void;
  backToAerial: () => void;
  openEnquiry: (id: string | null) => void;
  closeEnquiry: () => void;
  setReducedMotion: (v: boolean) => void;
  openPhotos: (id: string, set: "inside" | "outside") => void;
  closePhotos: () => void;
}

export const useTour = create<TourState>((set, get) => ({
  mode: "loading",
  selected: null,
  hovered: null,
  viewpoint: 0,
  room: null,
  enquiryFor: null,
  enquiryOpen: false,
  reducedMotion: false,
  photoTour: null,
  setMode: (mode) => set({ mode }),
  start: () => set({ mode: "aerial" }),
  select: (id) => {
    const m = get().mode;
    if (m === "interior" || m === "entering") return;
    set({ selected: id, mode: "location", viewpoint: 0 });
  },
  hover: (hovered) => set({ hovered }),
  enterVilla: (id) => set({ selected: id, mode: "villa", viewpoint: 0 }),
  setViewpoint: (viewpoint) => set({ viewpoint, mode: "villa" }),
  enterInterior: () => set({ mode: "entering" }),
  setRoom: (room) => set({ room }),
  exitInterior: () => set({ mode: "villa", room: null, viewpoint: 1 }),
  backToAerial: () => set({ mode: "aerial", selected: null, viewpoint: 0, room: null }),
  openEnquiry: (id) => set({ enquiryOpen: true, enquiryFor: id }),
  closeEnquiry: () => set({ enquiryOpen: false }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  openPhotos: (id, which) => set({ photoTour: { id, set: which } }),
  closePhotos: () => set({ photoTour: null }),
}));
