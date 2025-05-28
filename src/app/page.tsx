'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ArrowRight, User, Calendar, Search } from 'lucide-react';

import { api } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedList } from '@/components/ui/animated-list';
import { AnimatedCard } from '@/components/ui/animated-card';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { AnimatedLoading } from '@/components/animated-feedback';
import type { QuizzOutput } from '@/server/modules/quizz-taker/presentation/quizz/types';

export default function Home() {
	const { data: session } = useSession();
	const [searchTerm, setSearchTerm] = useState('');
	const [filteredQuizzes, setFilteredQuizzes] = useState<QuizzOutput[]>([]);

	// Fetch all published quizzes using the quizzTakerRouter
	const quizzesQuery = api.quizzTaker.quizz.getAllQuizz.useQuery();

	// Filter quizzes based on search term
	useEffect(() => {
		if (!quizzesQuery.data) return;

		if (!searchTerm.trim()) {
			setFilteredQuizzes(quizzesQuery.data);
			return;
		}

		const filtered = quizzesQuery.data.filter(
			quiz =>
				quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(quiz.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false),
		);

		setFilteredQuizzes(filtered);
	}, [searchTerm, quizzesQuery.data]);

	return (
		<main className='min-h-screen bg-background'>
			{/* Hero Section */}
			<section className='relative overflow-hidden bg-gradient-to-b from-primary/20 to-background pt-24 pb-16'>
				<div className='container px-4 md:px-6'>
					<AnimatedContainer>
						<div className='flex flex-col items-center space-y-4 text-center'>
							<h1 className='text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl'>
								Discover and Take <span className='text-primary'>Quizzes</span>
							</h1>
							<p className='max-w-[700px] text-muted-foreground md:text-xl'>
								Test your knowledge with our collection of quizzes created by our community.
							</p>

							<div className='w-full max-w-sm space-y-2'>
								<div className='relative'>
									<Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
									<Input
										placeholder='Search quizzes...'
										value={searchTerm}
										onChange={e => setSearchTerm(e.target.value)}
										className='pl-8'
									/>
								</div>
							</div>

							{session && (
								<div className='mt-8 flex gap-4'>
									<Link href='/dashboard' passHref>
										<Button variant='outline' className='gap-1'>
											Dashboard
											<ArrowRight className='h-4 w-4' />
										</Button>
									</Link>
									<Link href='/quizz' passHref>
										<Button className='gap-1'>
											Take Quizzes
											<ArrowRight className='h-4 w-4' />
										</Button>
									</Link>
								</div>
							)}
						</div>
					</AnimatedContainer>
				</div>
			</section>

			{/* Quizzes Section */}
			<section className='py-12'>
				<div className='container px-4 md:px-6'>
					<h2 className='mb-8 text-3xl font-bold tracking-tight'>Available Quizzes</h2>

					{quizzesQuery.isLoading && (
						<div className='flex justify-center py-12'>
							<AnimatedLoading />
						</div>
					)}

					{quizzesQuery.error && (
						<p className='text-center text-destructive py-12'>
							Error loading quizzes: {quizzesQuery.error.message}
						</p>
					)}

					{!quizzesQuery.isLoading && !quizzesQuery.error && filteredQuizzes.length === 0 && (
						<p className='text-center text-muted-foreground py-12'>
							{searchTerm.trim() ? 'No quizzes match your search.' : 'No quizzes available yet.'}
						</p>
					)}

					{filteredQuizzes.length > 0 && (
						<AnimatedList className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
							{filteredQuizzes.map((quiz, index) => (
								<AnimatedCard key={quiz.id} index={index}>
									<Card className='group h-full overflow-hidden border-0 bg-card transition-all hover:shadow-xl'>
										{/* Card Top Accent */}
										<div className='h-2 w-full bg-primary' />

										<CardHeader className='pt-6'>
											<CardTitle className='line-clamp-1 text-xl'>{quiz.title}</CardTitle>
											{quiz.description && (
												<CardDescription className='line-clamp-2 mt-2 text-sm'>
													{quiz.description}
												</CardDescription>
											)}
										</CardHeader>

										<CardContent className='pb-6'>
											<div className='rounded-lg bg-primary/5 p-3'>
												<div className='flex items-center gap-3 text-sm'>
													<div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10'>
														<User className='h-4 w-4 text-primary' />
													</div>
													<span className='font-medium'>{quiz.createdBy}</span>
												</div>
												<div className='mt-3 flex items-center gap-3 text-sm'>
													<div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10'>
														<Calendar className='h-4 w-4 text-primary' />
													</div>
													<span>{new Date(quiz.updatedAt).toLocaleDateString()}</span>
												</div>
											</div>
										</CardContent>

										<CardFooter className='p-0'>
											<Link href={`/quizz/${quiz.id}`} passHref className='w-full'>
												<Button
													className='group w-full rounded-none gap-2 h-12 transition-all bg-primary/90 hover:bg-primary'
													size='lg'
												>
													Take Quiz
													<ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
												</Button>
											</Link>
										</CardFooter>
									</Card>
								</AnimatedCard>
							))}
						</AnimatedList>
					)}
				</div>
			</section>
		</main>
	);
}
