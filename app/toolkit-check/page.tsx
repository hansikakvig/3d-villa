import type { Metadata } from "next";
import ToolkitCheck from "./ToolkitCheck";

export const metadata: Metadata = { title: "3D Toolkit Check", robots: { index: false, follow: false } };

export default function Page() {
  return <ToolkitCheck />;
}
