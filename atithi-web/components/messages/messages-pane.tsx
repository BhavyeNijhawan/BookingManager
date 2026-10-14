"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Zap } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { ConversationList } from "./conversation-list";
import { viewOf, type InboxView } from "./model";
import { ScheduleList } from "./schedule-list";
import { ViewSwitch } from "./view-switch";

/** The laptop conversation column. Reads ?view=, so it renders inside <Suspense>. */
export function MessagesPane() {
  const view = viewOf(useSearchParams().get("view"));
  const pathname = usePathname();
  return <Pane view={view} pathname={pathname} />;
}

/** Same column before the URL is known (fallback params suspend usePathname): the chats view, nothing selected. */
export function MessagesPaneFallback() {
  return <Pane view="chats" pathname={null} />;
}

function Pane({ view, pathname }: { view: InboxView; pathname: string | null }) {
  return (
    <>
      <div className="shrink-0 px-5 pt-8 pb-4">
        <p className="text-small text-ink-2">WhatsApp, one number for every guest</p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <h2 className="text-title font-medium text-ink">Messages</h2>
          <ButtonLink href="/more/automations" variant="ghost" size="sm" icon={<Zap aria-hidden />} className="-mr-2 text-accent">
            Automations
          </ButtonLink>
        </div>
        <ViewSwitch view={view} base={pathname ?? "/messages"} className="mt-4" />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-8">
        {view === "chats" ? <ConversationList variant="pane" pathname={pathname} /> : <ScheduleList variant="pane" />}
      </div>
    </>
  );
}
