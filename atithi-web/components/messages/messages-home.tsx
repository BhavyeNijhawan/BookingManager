"use client";

import { useSearchParams } from "next/navigation";
import { Clock, MessageCircle, Zap } from "lucide-react";
import { PageBody, PageHeader } from "@/components/shell/page-header";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/surface";
import { ConversationList } from "./conversation-list";
import { viewOf, type InboxView } from "./model";
import { ScheduleList } from "./schedule-list";
import { ViewSwitch } from "./view-switch";

/** /messages: the list on phones, a quiet placeholder in the right pane on laptops. */
export function MessagesHome() {
  const view = viewOf(useSearchParams().get("view"));
  return <Home view={view} />;
}

export function MessagesHomeFallback() {
  return <Home view="chats" />;
}

function Home({ view }: { view: InboxView }) {
  return (
    <>
      <div className="lg:hidden">
        <PageHeader
          kicker="WhatsApp, one number for every guest"
          title="Messages"
          mobileActions={
            <ButtonLink href="/more/automations" variant="ghost" size="sm" className="text-accent">
              Automations
            </ButtonLink>
          }
        />
        <PageBody>
          <ViewSwitch view={view} base="/messages" />
          <div className="mt-5">{view === "chats" ? <ConversationList variant="page" /> : <ScheduleList variant="page" />}</div>
          {view === "chats" && (
            <p className="mt-4 flex gap-2 px-1 text-small text-ink-2">
              <Zap aria-hidden className="mt-[3px] size-3.5 shrink-0" strokeWidth={2} />
              Messages marked “Sent automatically” came from an automation. Guests see one WhatsApp business number.
            </p>
          )}
        </PageBody>
      </div>

      <div className="hidden h-full items-center justify-center px-10 lg:flex">
        <h1 className="sr-only">Messages</h1>
        {view === "chats" ? (
          <EmptyState
            icon={<MessageCircle aria-hidden />}
            title="Pick a conversation"
            description="Every guest writes to one WhatsApp business number. Messages marked “Sent automatically” came from an automation."
          />
        ) : (
          <EmptyState
            icon={<Clock aria-hidden />}
            title="Nothing goes out unseen"
            description="Reminders, check-in details and the caretaker’s briefing are listed on the left before they are sent."
          />
        )}
      </div>
    </>
  );
}
