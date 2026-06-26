import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LostInVirtual | Citizen Registry",
  description: "The digital frontier's premier citizen registry. Register, activate, connect.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
