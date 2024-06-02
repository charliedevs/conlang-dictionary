import "~/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";

import { cn } from "~/lib/utils";
import { Toaster } from "../components/ui/sonner";
import { TopNav } from "./_components/topnav";
import Providers from "./providers";
import { Footer } from "./_components/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Conlang Dictionary",
  description: "Store and share your conlangs",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <Providers>
          <body className={cn("font-sans", inter.variable)}>
            <div className="grid grid-rows-[auto,1fr]">
              <TopNav />
              <main className="overflow-y-auto">
                {children}
                <Footer />
              </main>
            </div>
            <Toaster />
          </body>
        </Providers>
      </html>
    </ClerkProvider>
  );
}
