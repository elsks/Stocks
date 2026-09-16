import { navSections } from "@/lib/navigation";
import { PlaceholderPage } from "@/components/placeholder-page";

export default function KiResearchPage() {
  const section = navSections.find((s) => s.href === "/ki-research")!;
  return <PlaceholderPage section={section} />;
}
