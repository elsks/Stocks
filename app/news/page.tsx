import { navSections } from "@/lib/navigation";
import { PlaceholderPage } from "@/components/placeholder-page";

export default function NewsPage() {
  const section = navSections.find((s) => s.href === "/news")!;
  return <PlaceholderPage section={section} />;
}
