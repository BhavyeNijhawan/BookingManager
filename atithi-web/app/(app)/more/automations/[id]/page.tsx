import type { Metadata } from "next";
import { Suspense } from "react";
import { SEED_AUTOMATIONS } from "@/lib/seed";
import { AutomationDetail } from "@/components/automations/automation-detail";

export async function generateStaticParams() {
  return SEED_AUTOMATIONS.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: PageProps<"/more/automations/[id]">): Promise<Metadata> {
  const { id } = await params;
  const rule = SEED_AUTOMATIONS.find((a) => a.id === id);
  return { title: rule ? rule.name : "Automations" };
}

/** The param read sits inside Suspense so moving between rules never blocks. */
export default function AutomationPage({ params }: PageProps<"/more/automations/[id]">) {
  return (
    <Suspense>
      <Rule params={params} />
    </Suspense>
  );
}

async function Rule({ params }: Pick<PageProps<"/more/automations/[id]">, "params">) {
  const { id } = await params;
  return <AutomationDetail id={id} />;
}
