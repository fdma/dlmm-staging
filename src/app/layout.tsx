import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Banner from '@/components/Banner';
import ReactQueryProvider from '@/components/ReactQueryProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Meteora Monitor',
    description: 'Monitor Meteora pools and tokens',
    icons: {
        icon: [
            { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
            { url: '/favicon.svg', type: 'image/svg+xml' },
        ],
        shortcut: '/favicon.ico',
        apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="h-full">
            <body className={`${inter.className} h-full flex flex-col`}>
                <ReactQueryProvider>
                    <div className="flex flex-col min-h-full">
                        <Banner />
                        <main className="flex-1">
                            {children}
                        </main>
                    </div>
                </ReactQueryProvider>
            </body>
        </html>
    );
} 