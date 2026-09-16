import { navSections } from "@/lib/navigation";
import { PlaceholderPage } from "@/components/placeholder-page";

export default function RohstoffePage() {
  const section = navSections.find((s) => s.href === "/rohstoffe")!;
  return <PlaceholderPage section={section} />;
}
