"use client";

import { Inter } from 'next/font/google';
import './globals.css';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { AuthProvider } from '../context/authContext';
import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
    const pathname = usePathname();
    const hasCustomLayout = pathname.startsWith('/admin') || pathname.startsWith('/teacher') || pathname.startsWith('/chief');

    return (
        <html lang="fr">
        <body className={inter.className}>
        <AuthProvider>
            <Toaster position="top-right" reverseOrder={false} />

            <div className="flex flex-col min-h-screen">
                {!hasCustomLayout && <Header />}
                <main className="flex-grow">{children}</main>
                {!hasCustomLayout && <Footer />}
            </div>
        </AuthProvider>
        </body>
        </html>
    );
}