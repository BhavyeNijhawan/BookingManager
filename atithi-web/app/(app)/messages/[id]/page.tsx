import type { Metadata } from "next";
import { Suspense } from "react";
import { SEED_THREADS } from "@/lib/seed";
import { ThreadFallback, ThreadView } from "@/components/messages/thread-view";

export async function generateStaticParams() {
  return SEED_THREADS.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: PageProps<"/messages/[id]">): Promise<Metadata> {
  const { id } = await params;
  const thread = SEED_THREADS.find((t) => t.id === id);
  return { title: thread ? thread.who : "Messages" };
}

/** The param read sits inside Suspense so a switch between conversations never blocks. */
export default function ThreadPage({ params }: PageProps<"/messages/[id]">) {
  return (
    <Suspense fallback={<ThreadFallback />}>
      <Thread params={params} />
    </Suspense>
  );
}

async function Thread({ params }: Pick<PageProps<"/messages/[id]">, "params">) {
  const { id } = await params;
  return <ThreadView id={id} />;
}
