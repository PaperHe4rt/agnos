import type { Metadata } from "next";
import { Figtree, Space_Mono } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Agnos patient intake",
  description:
    "Patients fill in their details on their own device while the front desk watches the answers arrive.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${spaceMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-canvas text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
