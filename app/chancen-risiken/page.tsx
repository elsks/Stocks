import { navSections } from "@/lib/navigation";
import { PlaceholderPage } from "@/components/placeholder-page";

export default function ChancenRisikenPage() {
  const section = navSections.find((s) => s.href === "/chancen-risiken")!;
  return <PlaceholderPage section={section} />;
}
