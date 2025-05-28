'use client';

import { api } from '@/trpc/react';
import { type inferRouterOutputs } from '@trpc/server';
import { type AppRouter } from '@/server/api/root';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { z } from 'zod';

type QuizzParams = {
	params: {
		quizzId: string;
	};
};

// We'll infer types from tRPC router outputs
type RouterOutput = inferRouterOutputs<AppRouter>;
type QuizzOutput = RouterOutput['quizzTaker']['quizz']['getQuizzById'];
type QuestionOutput = RouterOutput['quizzTaker']['question']['getAllQuestions'][number];
type AnswerOutput = RouterOutput['quizzTaker']['answer']['getAllAnswers'][number];

const PlayerSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.string().email('Invalid email address'),
});

type PlayerFormData = z.infer<typeof PlayerSchema>;

export default function QuizzPage() {
	const router = useRouter();
	const params = useParams();
	const [quizzId, setQuizzId] = useState<string>('');

	useEffect(() => {
		if (params.quizzId) {
			setQuizzId(typeof params.quizzId === 'string' ? params.quizzId : '');
		}
	}, [params]);

	// State for the quiz flow
	const [currentStep, setCurrentStep] = useState<'registration' | 'questions' | 'results'>('registration');
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [playerAnswers, setPlayerAnswers] = useState<Record<string, string>>({});
	const [playerData, setPlayerData] = useState<PlayerFormData>({ name: '', email: '' });
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});
	const [attemptId, setAttemptId] = useState<string | null>(null);
	const [playerId, setPlayerId] = useState<string | null>(null);

	// Fetch quiz data
	const { data: quizz, isLoading: quizzLoading } = api.quizzTaker.quizz.getQuizzById.useQuery(
		{ id: quizzId },
		{ enabled: !!quizzId && quizzId.length > 0 },
	);

	// Fetch questions for the quiz
	const { data: questions, isLoading: questionsLoading } = api.quizzTaker.question.getAllQuestions.useQuery(
		{ quizzId },
		{ enabled: !!quizzId && quizzId.length > 0 },
	);

	// Get answers for the current question
	const currentQuestion = questions?.[currentQuestionIndex];
	const { data: answers, isLoading: answersLoading } = api.quizzTaker.answer.getAllAnswers.useQuery(
		{ questionId: currentQuestion?.id ?? '' },
		{ enabled: !!currentQuestion?.id },
	);

	// Mutations
	const savePlayerMutation = api.quizzTaker.player.savePlayer.useMutation();
	const saveAttemptMutation = api.quizzTaker.attempt.saveAttempt.useMutation();
	const saveResponseMutation = api.quizzTaker.response.saveResponse.useMutation();

	// Handle player registration
	const handlePlayerRegistration = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			// Validate form data
			const validatedData = PlayerSchema.parse(playerData);

			// Save player
			const player = await savePlayerMutation.mutateAsync({
				name: validatedData.name,
				email: validatedData.email,
			});

			// Store player ID
			setPlayerId(player.id);

			// Create attempt
			const attempt = await saveAttemptMutation.mutateAsync({
				quizzId,
				playerId: player.id,
			});

			setAttemptId(attempt.id);
			setCurrentStep('questions');
			setFormErrors({});
			toast.success("Registration successful! Let's start the quiz.");
		} catch (error) {
			if (error instanceof z.ZodError) {
				const errors: Record<string, string> = {};
				error.errors.forEach(err => {
					if (err.path) {
						errors[err.path[0].toString()] = err.message;
					}
				});
				setFormErrors(errors);
			} else {
				console.error('Registration error:', error);
				toast.error('There was a problem with registration. Please try again.');
			}
		}
	};

	// Handle answer selection
	const handleAnswerSelect = (answerId: string) => {
		if (currentQuestion) {
			setPlayerAnswers({
				...playerAnswers,
				[currentQuestion.id]: answerId,
			});
		}
	};

	// Calculate time spent on question
	const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

	// Reset timer when question changes
	useEffect(() => {
		setQuestionStartTime(Date.now());
	}, [currentQuestionIndex]);

	// Handle next question or finish
	const handleNextQuestion = async () => {
		if (!currentQuestion || !attemptId || !playerId) return;

		const selectedAnswerId = playerAnswers[currentQuestion.id];
		if (!selectedAnswerId) return;

		try {
			// Calculate time taken to answer
			const timeTakenMs = Date.now() - questionStartTime;

			// Save the response
			await saveResponseMutation.mutateAsync({
				attemptId,
				questionId: currentQuestion.id,
				answerId: selectedAnswerId,
				timeTakenMs,
				quizzId,
				playerId,
			});

			// Check if this is the last question
			const isLastQuestion = currentQuestionIndex >= (questions?.length ?? 0) - 1;

			// If it's the last question, update the attempt as completed
			if (isLastQuestion) {
				// We don't need to wait for this to complete before showing results
				saveAttemptMutation.mutate({
					quizzId,
					playerId: playerId!, // We've stored the player ID during registration
					completedAt: new Date(),
				});

				setCurrentStep('results');
				toast.success('Quiz completed! Thank you for participating.');
			} else {
				// Move to next question
				setCurrentQuestionIndex(currentQuestionIndex + 1);
			}
		} catch (error) {
			console.error('Error saving response:', error);
			toast.error('There was a problem saving your answer. Please try again.');
		}
	};

	// Loading states
	if (quizzLoading) {
		return (
			<div className='container mx-auto py-10'>
				<Skeleton className='h-10 w-3/4 mb-6' />
				<Skeleton className='h-6 w-1/2 mb-4' />
				<Skeleton className='h-40 w-full mb-6' />
			</div>
		);
	}

	// Quiz not found
	if (!quizz) {
		return (
			<div className='container mx-auto py-10'>
				<h1 className='text-3xl font-bold mb-6'>Quiz Not Found</h1>
				<p className='mb-6'>The quiz you're looking for doesn't exist or has been removed.</p>
				<Button onClick={() => router.push('/quizz')}>Back to Quizzes</Button>
			</div>
		);
	}

	return (
		<div className='container mx-auto py-10'>
			<h1 className='text-3xl font-bold mb-2'>{quizz.title}</h1>
			<p className='text-gray-600 mb-6'>Created by {quizz.createdBy}</p>

			{quizz.description && (
				<div className='bg-gray-50 p-4 rounded-md mb-8'>
					<p>{quizz.description}</p>
				</div>
			)}

			{currentStep === 'registration' && (
				<Card className='max-w-md mx-auto shadow-md border-t-4 border-t-primary'>
					<CardHeader>
						<CardTitle>Register to take the quiz</CardTitle>
						<CardDescription>Please provide your information to start</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handlePlayerRegistration} className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='name'>Name</Label>
								<Input
									id='name'
									value={playerData.name}
									onChange={e => setPlayerData({ ...playerData, name: e.target.value })}
									placeholder='Your name'
									disabled={savePlayerMutation.isPending || saveAttemptMutation.isPending}
								/>
								{formErrors.name && <p className='text-sm text-destructive'>{formErrors.name}</p>}
							</div>

							<div className='space-y-2'>
								<Label htmlFor='email'>Email</Label>
								<Input
									id='email'
									type='email'
									value={playerData.email}
									onChange={e => setPlayerData({ ...playerData, email: e.target.value })}
									placeholder='your.email@example.com'
									disabled={savePlayerMutation.isPending || saveAttemptMutation.isPending}
								/>
								{formErrors.email && <p className='text-sm text-destructive'>{formErrors.email}</p>}
							</div>

							<Button
								type='submit'
								className='w-full'
								disabled={savePlayerMutation.isPending || saveAttemptMutation.isPending}
							>
								{savePlayerMutation.isPending || saveAttemptMutation.isPending ? (
									<>
										<span className='mr-2'>Loading...</span>
										<Skeleton className='h-4 w-4 rounded-full animate-spin' />
									</>
								) : (
									'Start Quiz'
								)}
							</Button>
						</form>
					</CardContent>
				</Card>
			)}

			{currentStep === 'questions' && currentQuestion && (
				<Card className='shadow-md border-t-4 border-t-primary'>
					<CardHeader>
						<CardTitle className='flex justify-between items-center'>
							<span>
								Question {currentQuestionIndex + 1} of {questions?.length}
							</span>
							<span className='text-sm font-normal text-muted-foreground'>
								{Math.round(((currentQuestionIndex + 1) / (questions?.length ?? 1)) * 100)}% Complete
							</span>
						</CardTitle>
						<div className='w-full bg-muted h-2 rounded-full overflow-hidden'>
							<div
								className='bg-primary h-full transition-all duration-300 ease-in-out'
								style={{
									width: `${Math.round(
										((currentQuestionIndex + 1) / (questions?.length ?? 1)) * 100,
									)}%`,
								}}
							/>
						</div>
					</CardHeader>
					<CardContent>
						<div className='mb-6'>
							<h2 className='text-xl font-semibold mb-2'>{currentQuestion.text}</h2>
							{currentQuestion.imageUrl && (
								<div className='bg-muted rounded-md p-2 mb-4'>
									<img
										src={currentQuestion.imageUrl}
										alt={`Question ${currentQuestionIndex + 1}`}
										className='rounded-md max-h-60 object-contain mx-auto'
									/>
								</div>
							)}
						</div>

						{answersLoading ? (
							<div className='space-y-2'>
								{Array.from({ length: 4 }).map((_, i) => (
									<Skeleton key={i} className='h-12 w-full' />
								))}
							</div>
						) : (
							<RadioGroup
								value={playerAnswers[currentQuestion.id] || ''}
								onValueChange={value => handleAnswerSelect(value)}
								className='space-y-2'
							>
								{answers?.length ? (
									answers.map(answer => (
										<div
											key={answer.id}
											className={`flex items-center space-x-2 border p-3 rounded-md hover:bg-muted/50 transition-colors ${
												playerAnswers[currentQuestion.id] === answer.id
													? 'border-primary bg-primary/5'
													: ''
											}`}
										>
											<RadioGroupItem value={answer.id} id={answer.id} />
											<Label htmlFor={answer.id} className='flex-grow cursor-pointer'>
												{answer.text}
											</Label>
										</div>
									))
								) : (
									<div className='text-center py-4 text-muted-foreground'>
										No answers available for this question
									</div>
								)}
							</RadioGroup>
						)}
					</CardContent>
					<CardFooter>
						<Button
							onClick={handleNextQuestion}
							disabled={!playerAnswers[currentQuestion.id] || saveResponseMutation.isPending}
							className='ml-auto'
						>
							{saveResponseMutation.isPending ? (
								<>
									<span className='mr-2'>Saving...</span>
									<Skeleton className='h-4 w-4 rounded-full animate-spin' />
								</>
							) : currentQuestionIndex < (questions?.length ?? 0) - 1 ? (
								'Next Question'
							) : (
								'Finish Quiz'
							)}
						</Button>
					</CardFooter>
				</Card>
			)}

			{currentStep === 'results' && (
				<Card className='shadow-md border-t-4 border-t-green-500'>
					<CardHeader className='text-center'>
						<div className='mx-auto mb-4 bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-8 w-8 text-green-600'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
							</svg>
						</div>
						<CardTitle className='text-2xl'>Quiz Completed!</CardTitle>
						<CardDescription className='text-lg'>Thank you for taking the quiz</CardDescription>
					</CardHeader>
					<CardContent className='text-center'>
						<p className='text-lg mb-4'>
							You've successfully completed the quiz. Your responses have been recorded.
						</p>
						<p className='text-muted-foreground mb-6'>
							We'll calculate your results and may contact you via email with your score.
						</p>
					</CardContent>
					<CardFooter className='flex justify-center gap-4'>
						<Button onClick={() => router.push('/quizz')} variant='outline'>
							Back to Quizzes
						</Button>
						<Button onClick={() => window.location.reload()}>Take Again</Button>
					</CardFooter>
				</Card>
			)}
		</div>
	);
}
