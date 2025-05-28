import '@/styles/globals.css';

import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';

import { TRPCReactProvider } from '@/trpc/react';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { Header } from '@/components/header';

export const metadata: Metadata = {
	title: 'Quizz App',
	description: 'Create and take quizzes online',
	icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang='en' className={`${GeistSans.variable}`} suppressHydrationWarning>
			<body className="min-h-screen flex flex-col">
				<SessionProvider>
					<TRPCReactProvider>
						<ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
							<Header />
							<main className="flex-1">
								{children}
							</main>
							<Toaster />
						</ThemeProvider>
					</TRPCReactProvider>
				</SessionProvider>
			</body>
		</html>
	);
}
