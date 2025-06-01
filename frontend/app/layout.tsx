import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Veteriner Kliniği - Oy Verme Sistemi",
  description: "En iyi veteriner hekimleri için oy verin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#9cc7e9" />
      </head>
      <body className="antialiased">
        <div className="page-container">
          {children}
        </div>
      </body>
    </html>
  );
}