import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CHÁ DE BEBÊ DO OTTO",
  description:
    "O Bosque está em festa! Sábado, 09 de janeiro de 2027, às 11h — Espaço de Festas da Neguinha.",
  openGraph: {
    title: "CHÁ DE BEBÊ DO OTTO",
    description:
      "O Bosque está em festa! Confirme sua presença para celebrar a chegada do Otto.",
    images: [
      {
        url: "/illustrations/arte-convite.jpg",
        width: 1200,
        height: 630,
        alt: "Chá de Bebê do Otto - Turma do Ursinho Pooh",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
