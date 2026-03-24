import "./globals.css";

import { TopNav } from "@/components/top-nav";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "MarkerMate CBSE",
  description: "CBSE-style board answer checker for Class 10 students."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body>
        <div className="pageShell">
          <TopNav user={user} />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
