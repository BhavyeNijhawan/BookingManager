"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Check, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { SheetActions, SheetHeader } from "@/components/ui/sheet";

type StepState = "done" | "current" | "todo" | "failed" | "skipped";

interface Step {
  title: string;
  body: ReactNode;
  actions?: ReactNode;
}

/**
 * The MakeMyTrip pay-at-property story, one step at a time. Each button moves the sample
 * data forward and takes you to the screen where it shows.
 */
export function DemoSheet() {
  const router = useRouter();
  const step = useStore((s) => s.demoStep);
  const demo = useStore((s) => s.bookings.find((b) => b.id === "bdemo"));
  const demoReceive = useStore((s) => s.demoReceive);
  const demoConfirm = useStore((s) => s.demoConfirm);
  const demoPay = useStore((s) => s.demoPay);
  const demoFlag = useStore((s) => s.demoFlag);
  const demoReset = useStore((s) => s.demoReset);
  const closeSheet = useStore((s) => s.closeSheet);

  const flagged = !!demo && (demo.status === "flagged" || (demo.status === "cancelled" && demo.tl.some((t) => t.text.startsWith("Flagged"))));

  const steps: Step[] = [
    {
      title: "A MakeMyTrip booking arrives",
      body: "Arjun Mehta books the Main Villa for 20–21 Oct and will pay at the property. Atithi reads the MakeMyTrip email, holds the night on Airbnb, Booking.com and Agoda, and asks Arjun on WhatsApp to confirm.",
      actions: (
        <Button
          variant="primary"
          onClick={() => {
            demoReceive();
            router.push("/");
          }}
        >
          Receive the booking
        </Button>
      ),
    },
    flagged
      ? {
          title: "The guest never replies",
          body: "Two reminders go out overnight. After 24 hours with no reply and no advance, Atithi flags the booking as likely fake.",
        }
      : {
          title: "The guest taps “Haan, aa rahe hain”",
          body: "The status moves to Guest said yes, and a Razorpay link for the ₹3,000 advance goes out on its own.",
          actions: (
            <>
              <Button
                variant="primary"
                onClick={() => {
                  demoConfirm();
                  router.push("/messages/tbdemo");
                }}
              >
                Guest confirms
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  demoFlag();
                  router.push("/");
                }}
              >
                24 hours pass, no reply
              </Button>
            </>
          ),
        },
    {
      title: "The advance is paid",
      body: flagged
        ? "This never happens for a fake booking."
        : "The booking becomes Confirmed. You get a notification, Arjun gets a receipt, and Ramesh bhai sees the check-in on the caretaker list for the 20th.",
      actions: (
        <Button
          variant="primary"
          onClick={() => {
            demoPay();
            router.push("/bookings/bdemo");
          }}
        >
          Guest pays ₹3,000
        </Button>
      ),
    },
    {
      title: "Done",
      body: flagged
        ? "Arjun Mehta now waits under Needs your attention on Today. Cancel on MakeMyTrip with one tap and the night opens everywhere again, as it did for Amit Joshi under Bookings, Cancelled."
        : "Compare with Amit Joshi under Bookings, Cancelled: Amit never replied, and the dates were released within 24 hours.",
    },
  ];

  const stateOf = (i: number): StepState => {
    if (flagged) return i === 0 ? "done" : i === 1 ? "failed" : i === 2 ? "skipped" : "done";
    if (i === steps.length - 1 && step >= i) return "done";
    return i < step ? "done" : i === step ? "current" : "todo";
  };

  const reset = () => {
    demoReset();
    if (window.location.pathname.includes("demo")) router.push("/");
  };

  return (
    <>
      <SheetHeader
        kicker="Demo"
        title="A pay-at-property booking lands"
        description="What Atithi does on its own when a MakeMyTrip guest books and promises to pay at the property. Each step moves the sample data forward and shows you where it happened."
      />

      <ol className="flex flex-col">
        {steps.map((s, i) => {
          const state = stateOf(i);
          const last = i === steps.length - 1;
          const lineDone = state === "done" && !last && stateOf(i + 1) !== "todo";
          return (
            <li key={i} aria-current={state === "current" ? "step" : undefined} className={cn("relative flex gap-4", !last && "pb-6")}>
              {!last && (
                <span aria-hidden className={cn("absolute top-8 bottom-1.5 left-[13px] w-[1.5px] rounded-full", lineDone ? "bg-ink" : "bg-line-2")} />
              )}
              <Marker n={i + 1} state={state} />
              <div className={cn("min-w-0 flex-1 pt-[3px]", state === "current" && "pb-1")}>
                <p
                  className={cn(
                    "font-medium",
                    state === "todo" || state === "skipped" ? "text-ink-2" : state === "failed" ? "text-alert-ink" : "text-ink",
                  )}
                >
                  {s.title}
                  <span className="sr-only">
                    {state === "done" ? ", done" : state === "current" ? ", next" : state === "failed" ? ", did not happen" : state === "skipped" ? ", skipped" : ", later"}
                  </span>
                </p>
                <p className={cn("mt-1 text-small", state === "todo" || state === "skipped" ? "text-ink-3" : "text-ink-2")}>{s.body}</p>
                {state === "current" && s.actions && <div className="mt-3.5 flex flex-wrap gap-2">{s.actions}</div>}
              </div>
            </li>
          );
        })}
      </ol>

      {step > 0 && (
        <SheetActions className="border-t border-line pt-5">
          <Button variant="secondary" icon={<RotateCcw aria-hidden />} onClick={reset}>
            Reset the demo
          </Button>
          {step >= 3 && demo && (
            <Button
              variant="primary"
              onClick={() => {
                closeSheet();
                router.push("/bookings/bdemo");
              }}
            >
              Open the booking
            </Button>
          )}
        </SheetActions>
      )}
    </>
  );
}

function Marker({ n, state }: { n: number; state: StepState }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full text-small font-medium tabular",
        state === "done" && "bg-ink text-paper",
        state === "current" && "border-[1.5px] border-ink bg-surface text-ink",
        state === "todo" && "border border-line-2 bg-surface text-ink-3",
        state === "skipped" && "border border-dashed border-line-2 bg-surface text-ink-3",
        state === "failed" && "bg-alert-ink text-white",
      )}
    >
      {state === "done" ? (
        <Check className="size-3.5" strokeWidth={2.5} />
      ) : state === "failed" ? (
        <X className="size-3.5" strokeWidth={2.5} />
      ) : (
        n
      )}
    </span>
  );
}
