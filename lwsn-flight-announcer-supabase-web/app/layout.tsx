import './globals.css';

export const metadata = {
  title: 'LWSN Flight Announcer',
  description: 'Private pilots at LWSN: announce and track flights',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen max-w-xl mx-auto p-4">
        {children}
      </body>
    </html>
  );
}
