import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VetFiscal OS",
  description: "Cockpit operacional fiscal e financeiro para clínicas veterinárias."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
