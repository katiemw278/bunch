import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bunch — Daily Category Puzzle",
  description:
    "Nine categories. How few answers can you use to clear them all? A daily word puzzle.",
  openGraph: {
    title: "Bunch",
    description: "Nine categories. One clever word can clear them all.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#faf9f7] text-[#2c2c2c]">
        {children}
      </body>
    </html>
  );
}
