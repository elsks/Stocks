import { navSections } from "@/lib/navigation";
import { PlaceholderPage } from "@/components/placeholder-page";

export default function UnternehmenPage() {
  const section = navSections.find((s) => s.href === "/unternehmen")!;
  return <PlaceholderPage section={section} />;
}
