import { Cormorant_Garamond, Jost } from "next/font/google";
import "./virtual-tour.css";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-tb-serif" });
const sans = Jost({ subsets: ["latin"], variable: "--font-tb-sans" });

export default function VirtualTourLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${serif.variable} ${sans.variable} tb-root`}>{children}</div>;
}
