import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "CodeByte MVP",
  description: "Monorepo scaffold for the CodeByte MVP",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
