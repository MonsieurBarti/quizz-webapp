'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
	const { data: session, status } = useSession();

	return (
		<main className='flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 text-white p-8'>
			<div className='container flex flex-col items-center justify-center gap-12 px-4 py-16 text-center'>
				<h1 className='font-extrabold text-5xl tracking-tight sm:text-[5rem]'>
					Welcome to the <span className='text-purple-400'>Quiz WebApp</span>
				</h1>
				<p className='text-2xl text-slate-300'>Create, share, and take quizzes with ease.</p>

				<div className='mt-8'>
					{status === 'loading' && <p className='text-slate-400'>Loading session...</p>}

					{status === 'unauthenticated' && (
						<Button
							size='lg'
							className='bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-150 ease-in-out'
							onClick={() => signIn()}
						>
							Admin Login
						</Button>
					)}

					{status === 'authenticated' && session && (
						<div className='flex flex-col items-center gap-4'>
							<p className='text-xl text-slate-200'>
								Welcome, {session.user?.name || session.user?.email}!
							</p>
							<Link href="/dashboard" passHref>
								<Button
									size='lg'
									className='bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-150 ease-in-out'
								>
									Go to Dashboard
								</Button>
							</Link>
							<Button
								size='lg'
								variant='outline'
								className='border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-150 ease-in-out'
								onClick={() => signOut()}
							>
								Logout
							</Button>
						</div>
					)}
				</div>
			</div>
		</main>
	);
}
