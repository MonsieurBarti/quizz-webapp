'use client';

import { api } from '@/trpc/react';
import { type inferRouterOutputs } from '@trpc/server';
import { type AppRouter } from '@/server/api/root';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

// Infer types from tRPC router outputs
type RouterOutput = inferRouterOutputs<AppRouter>;
type QuizzOutput = RouterOutput['quizzTaker']['quizz']['getAllQuizz'][number];

export default function QuizzListPage() {
	const { data: quizzes, isLoading, error } = api.quizzTaker.quizz.getAllQuizz.useQuery();

	if (isLoading) {
		return (
			<div className='container mx-auto py-10'>
				<h1 className='text-3xl font-bold mb-2'>Available Quizzes</h1>
				<p className='text-muted-foreground mb-6'>Select a quiz to start testing your knowledge</p>

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{Array.from({ length: 6 }).map((_, index) => (
						<Card key={index} className='h-64 shadow-md border-t-4 border-t-primary'>
							<CardHeader>
								<Skeleton className='h-8 w-3/4 mb-2' />
								<Skeleton className='h-4 w-1/2' />
							</CardHeader>
							<CardContent>
								<Skeleton className='h-20 w-full' />
							</CardContent>
							<CardFooter>
								<Skeleton className='h-10 w-28' />
							</CardFooter>
						</Card>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='container mx-auto py-10'>
				<h1 className='text-3xl font-bold mb-2'>Available Quizzes</h1>
				<p className='text-muted-foreground mb-6'>Select a quiz to start testing your knowledge</p>

				<div className='p-4 bg-destructive/10 text-destructive rounded-md border border-destructive/20 flex items-center gap-2'>
					<svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
						<path
							fillRule='evenodd'
							d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
							clipRule='evenodd'
						/>
					</svg>
					<p>Error loading quizzes: {error.message}</p>
				</div>
				<div className='mt-4'>
					<Button onClick={() => window.location.reload()}>Try Again</Button>
				</div>
			</div>
		);
	}

	return (
		<div className='container mx-auto py-10'>
			<h1 className='text-3xl font-bold mb-2'>Available Quizzes</h1>
			<p className='text-muted-foreground mb-6'>Select a quiz to start testing your knowledge</p>

			{quizzes && quizzes.length > 0 ? (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{quizzes.map(quizz => (
						<Card
							key={quizz.id}
							className='h-full flex flex-col shadow-md border-t-4 border-t-primary hover:shadow-lg transition-shadow'
						>
							<CardHeader>
								<CardTitle className='line-clamp-1'>{quizz.title}</CardTitle>
								<CardDescription className='flex items-center gap-1'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-4 w-4'
										viewBox='0 0 20 20'
										fill='currentColor'
									>
										<path
											fillRule='evenodd'
											d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
											clipRule='evenodd'
										/>
									</svg>
									{quizz.createdBy}
								</CardDescription>
							</CardHeader>
							<CardContent className='flex-grow'>
								<p className='text-muted-foreground line-clamp-3'>
									{quizz.description || 'No description available'}
								</p>
							</CardContent>
							<CardFooter className='flex justify-between items-center border-t pt-4'>
								<span className='text-sm text-muted-foreground flex items-center gap-1'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-4 w-4'
										viewBox='0 0 20 20'
										fill='currentColor'
									>
										<path
											fillRule='evenodd'
											d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
											clipRule='evenodd'
										/>
									</svg>
									{formatDistanceToNow(new Date(quizz.updatedAt), { addSuffix: true })}
								</span>
								<Link href={`/quizz/${quizz.id}`}>
									<Button className='gap-1'>
										Take Quiz
										<svg
											xmlns='http://www.w3.org/2000/svg'
											className='h-4 w-4'
											viewBox='0 0 20 20'
											fill='currentColor'
										>
											<path
												fillRule='evenodd'
												d='M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z'
												clipRule='evenodd'
											/>
										</svg>
									</Button>
								</Link>
							</CardFooter>
						</Card>
					))}
				</div>
			) : (
				<div className='text-center py-10 bg-muted/20 rounded-lg border border-border p-8'>
					<div className='mx-auto mb-4 bg-muted p-3 rounded-full w-16 h-16 flex items-center justify-center'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-8 w-8 text-muted-foreground'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
							/>
						</svg>
					</div>
					<p className='text-xl font-medium'>No quizzes available yet</p>
					<p className='text-muted-foreground mt-2'>Check back later for new quizzes</p>
				</div>
			)}
		</div>
	);
}
