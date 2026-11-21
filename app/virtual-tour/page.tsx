import type { Metadata } from "next";
import VirtualTourExperience from "@/components/virtual-tour/VirtualTourExperience";

export const metadata: Metadata = {
  title: "Virtual Resort Tour | Touchwood Bliss, Igatpuri",
  description:
    "Explore Touchwood Bliss in 3D: fly over the resort, visit Amora, Farmsyde and Courtyard villas, and look around inside.",
};

export default function VirtualTourPage() {
  return <VirtualTourExperience />;
}
