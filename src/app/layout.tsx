import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "FromZero - AI Powered Learning",
  description: "Learn Smarter. Start From Zero. Grow Fast. Your personal AI tutor that turns confusion into clarity.",
  keywords: ["learning", "AI", "education", "courses", "programming", "skills"],
  authors: [{ name: "FromZero" }],
  openGraph: {
    title: "FromZero - AI Powered Learning",
    description: "Your personal AI tutor that turns confusion into clarity.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${lexend.variable} font-sans antialiased bg-[#f8fafb] text-[#34343d]`}>
        {children}
      </body>
    </html>
  );
}
