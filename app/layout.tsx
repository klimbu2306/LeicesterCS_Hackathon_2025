import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "../app/components/Header";
import { Footer } from "../app/components/Footer";
import Providers from "./providers"; // Import the new wrapper

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "FindMeParking",
    description: "Find parking near you.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en">
            <head>
                {/* eslint-disable-next-line @next/next/no-sync-scripts */}
                <script src="https://cdn.jsdelivr.net/npm/@tailwindplus/elements@1" type="module" />
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <Providers>
                    <Header />
                    {children}
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}
