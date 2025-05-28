'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AnimatedContainer } from '@/components/ui/animated-container';

export default function AdminPage() {
	const { data: session, status } = useSession();

	return (
		<main className='flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 text-white p-8'>
			<AnimatedContainer className='container flex flex-col items-center justify-center gap-12 px-4 py-16 text-center'>
				<h1 className='font-extrabold text-5xl tracking-tight sm:text-[5rem]'>
					<span className='text-primary'>Quiz Admin</span> Portal
				</h1>
				<p className='text-2xl text-slate-300'>Create, manage, and publish your quizzes.</p>

				<div className='mt-8'>
					{status === 'loading' && <p className='text-slate-400'>Loading session...</p>}

					{status === 'unauthenticated' && (
						<Button
							size='lg'
							className='text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-150 ease-in-out'
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
									className='text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-150 ease-in-out'
								>
									Go to Dashboard
								</Button>
							</Link>
							<Button
								size='lg'
								variant='outline'
								className='font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-150 ease-in-out'
								onClick={() => signOut()}
							>
								Logout
							</Button>
						</div>
					)}
				</div>
			</AnimatedContainer>
		</main>
	);
}
