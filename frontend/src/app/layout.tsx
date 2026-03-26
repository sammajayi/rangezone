import './global.css';
import { ReactNode } from 'react';
import { Providers } from './providers';
import Navbar from '../components/navbar';
import Footer from '../components/footer';


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>RangeZone - Predict BTC price movement magnitude, stake with conviction, and win RBTC.</title>

        <link rel="icon" href="/rangezone-favicon.svg" />
        {/* <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" /> */}
        <link rel="manifest" href="/site.webmanifest" />

        <meta name="description" content="RangeZone - Predict BTC price movement magnitude, stake with conviction, and win RBTC." />

        <meta property="og:title" content="RangeZone" />
        <meta property="og:description" content="Predict BTC price movement magnitude, stake with conviction, and win RBTC." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rangezone.vercel.app" />
        <meta property="og:image" content="/og-image.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="RangeZone" />
        <meta name="twitter:description" content="Predict BTC price movement magnitude, stake with conviction, and win RBTC." />
        <meta name="twitter:image" content="/og-image.png" />
      </head>
      <body>
        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}


