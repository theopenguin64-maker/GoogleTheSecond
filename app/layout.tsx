import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const productSans = localFont({
  src: [
    {
      path: './fonts/ProductSans-Thin.ttf',
      weight: '100',
      style: 'normal',
    },
    {
      path: './fonts/ProductSans-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/ProductSans-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/ProductSans-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/ProductSans-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/ProductSans-Black.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-product-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Google the Second',
  description: 'Search across your uploaded PDFs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={productSans.variable}>{children}</body>
    </html>
  );
}

