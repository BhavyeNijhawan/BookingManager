import { Suspense } from "react";
import { MessagesPane, MessagesPaneFallback } from "@/components/messages/messages-pane";

/**
 * Two panes from 1024px: conversations on the left with their own scroll, the open
 * conversation on the right. Phones show only the page.
 */
export default function MessagesLayout({ children }: LayoutProps<"/messages">) {
  return (
    <div className="lg:-mb-16 lg:grid lg:h-dvh lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)] lg:overflow-hidden min-[1524px]:border-r min-[1524px]:border-line">
      <aside aria-label="Conversations" className="hidden min-h-0 flex-col border-r border-line lg:flex">
        <Suspense fallback={<MessagesPaneFallback />}>
          <MessagesPane />
        </Suspense>
      </aside>
      <div className="min-w-0 lg:min-h-0">{children}</div>
    </div>
  );
}
