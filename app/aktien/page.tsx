import { navSections } from "@/lib/navigation";
import { PlaceholderPage } from "@/components/placeholder-page";

export default function AktienPage() {
  const section = navSections.find((s) => s.href === "/aktien")!;
  return <PlaceholderPage section={section} />;
}
