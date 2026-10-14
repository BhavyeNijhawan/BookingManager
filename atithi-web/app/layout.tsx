import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import { TipProvider } from "@/components/ui/bits";
import { PALETTE_BOOT } from "@/lib/palette";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Atithi", template: "%s – Atithi" },
  description:
    "Every booking from Airbnb, MakeMyTrip, Agoda and Booking.com in one place, with WhatsApp confirmations and pay-at-property verification.",
  applicationName: "Atithi",
  appleWebApp: { capable: true, title: "Atithi", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#f8f6f1",
  colorScheme: "light",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" data-palette="paper" className={poppins.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PALETTE_BOOT }} />
      </head>
      <body>
        <TipProvider delayDuration={250} skipDelayDuration={150}>
          {children}
        </TipProvider>
        <Toaster
          position="top-center"
          offset={16}
          mobileOffset={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)", left: 12, right: 12 }}
          gap={8}
          toastOptions={{
            unstyled: true,
            classNames: {
              toast:
                "flex w-[min(380px,calc(100vw-24px))] items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-ink shadow-float",
              title: "text-small font-medium text-ink",
              description: "mt-0.5 text-small text-ink-2",
              actionButton: "ml-auto shrink-0 rounded-md px-2 py-1 text-small font-medium text-accent hover:bg-accent-soft",
            },
          }}
        />
      </body>
    </html>
  );
}
