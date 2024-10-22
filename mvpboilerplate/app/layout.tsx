import { ClerkProvider } from "@clerk/nextjs";
import { Ubuntu } from "next/font/google";
import "./globals.css";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  variable: "--font-ubuntu-sans",
  weight: ["300", "400", "500", "700"],
});

export const metadata = {
  title: "DocuSense",
  description: "SaaS Boilerplate Template",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${ubuntu.variable} antialiased`}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
