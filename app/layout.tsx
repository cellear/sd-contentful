import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simplify Drupal",
  description: "Tips and insights for simplifying Drupal development",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

