import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Incubadora Neonatal IoT",
  description: "Prototipo educativo para monitoreo de incubadoras neonatales.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
