import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { AuthProvider } from "@/hooks/useAuth";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "QuestLink - Real-World Quests. Real-Time Connections.",
  description: "A freelance marketplace platform by Cirqle, inspired by anime guild boards. Connect with specialists, post quests, and discover services in your area.",
  keywords: ["freelance", "marketplace", "quests", "services", "specialists", "guild board", "cirqle"],
  authors: [{ name: "Cirqle" }],
  creator: "Cirqle",
  openGraph: {
    title: "QuestLink - Real-World Quests. Real-Time Connections.",
    description: "A freelance marketplace platform inspired by anime guild boards.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuestLink - Real-World Quests. Real-Time Connections.",
    description: "A freelance marketplace platform inspired by anime guild boards.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${poppins.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
