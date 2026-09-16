import { navSections } from "@/lib/navigation";
import { PlaceholderPage } from "@/components/placeholder-page";

export default function RegelnPage() {
  const section = navSections.find((s) => s.href === "/regeln")!;
  return <PlaceholderPage section={section} />;
}
