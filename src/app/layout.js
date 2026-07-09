import "./globals.css";

export const metadata = {
  title: "MCC Product Catalog",
  description: "Browse our exclusive collection of products.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
