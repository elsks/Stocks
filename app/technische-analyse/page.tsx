import { navSections } from "@/lib/navigation";
import { PlaceholderPage } from "@/components/placeholder-page";

export default function TechnischeAnalysePage() {
  const section = navSections.find((s) => s.href === "/technische-analyse")!;
  return <PlaceholderPage section={section} />;
}
