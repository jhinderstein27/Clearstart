import "./globals.css";

export const metadata = {
  title: "Clearstart | Portfolio Marketing Intelligence",
  description: "Marketing maturity audits for healthcare PE portfolio companies",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
