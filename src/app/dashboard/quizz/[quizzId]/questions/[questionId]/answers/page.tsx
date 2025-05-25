'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { api } from '@/trpc/react';
import { useState, useEffect } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner'; // Import toast

import { type inferRouterOutputs } from '@trpc/server';
import { type AppRouter } from '@/server/api/root'; // Adjust this path if your AppRouter is located elsewhere

// Define the type for an Answer using tRPC output inference
type RouterOutput = inferRouterOutputs<AppRouter>;
type AnswerOutput = RouterOutput['quizzCreator']['answer']['getAllAnswers'][number];

export default function ManageQuestionAnswersPage() {
	const params = useParams();
	const quizzId = params.quizzId as string;
	const questionId = params.questionId as string;
	const utils = api.useUtils(); // For cache invalidation

	console.log('ManageQuestionAnswersPage - quizzId:', quizzId, 'questionId:', questionId);

	const [isCreateAnswerDialogOpen, setIsCreateAnswerDialogOpen] = useState(false);
	const [newAnswerText, setNewAnswerText] = useState('');
	const [newAnswerIsCorrect, setNewAnswerIsCorrect] = useState(false);
	const [newAnswerOrder, setNewAnswerOrder] = useState(0);

	// State for Edit Answer Dialog
	const [isEditAnswerDialogOpen, setIsEditAnswerDialogOpen] = useState(false);
	const [answerToEdit, setAnswerToEdit] = useState<AnswerOutput | null>(null);
	const [editAnswerText, setEditAnswerText] = useState('');
	const [editAnswerIsCorrect, setEditAnswerIsCorrect] = useState(false);
	const [editAnswerOrder, setEditAnswerOrder] = useState(0);

	// State for Delete Answer Confirmation
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
	const [answerToDeleteId, setAnswerToDeleteId] = useState<string | null>(null);

	const {
		data: questionDetails,
		isLoading: isLoadingQuestion,
		isError: isErrorQuestion,
		error: questionError,
	} = api.quizzCreator.question.getQuestionById.useQuery({ id: questionId }, { enabled: !!questionId });

	// Fetch Answers for this question
	const {
		data: answers,
		isLoading: isLoadingAnswers,
		isError: isErrorAnswers,
		error: answersError,
	} = api.quizzCreator.answer.getAllAnswers.useQuery(
		{ questionId: questionId! }, // Ensure questionId is not null/undefined
		{ enabled: !!questionId }, // Only run query if questionId is available
	);

	const createAnswerMutation = api.quizzCreator.answer.createAnswer.useMutation({
		onSuccess: async () => {
			await utils.quizzCreator.answer.getAllAnswers.invalidate({ questionId });
			setIsCreateAnswerDialogOpen(false); // Close dialog
			// Reset form fields
			setNewAnswerText('');
			setNewAnswerIsCorrect(false);
			// Order will be updated by useEffect
			toast.success('Answer created successfully!');
		},
		onError: error => {
			console.error('Failed to create answer:', error);
			toast.error(error.message);
		},
	});

	// tRPC Mutation for Updating an Answer
	const updateAnswerMutation = api.quizzCreator.answer.updateAnswer.useMutation({
		onSuccess: async () => {
			await utils.quizzCreator.answer.getAllAnswers.invalidate({ questionId });
			setIsEditAnswerDialogOpen(false);
			setAnswerToEdit(null);
			toast.success('Answer updated successfully!');
		},
		onError: error => {
			console.error('Failed to update answer:', error);
			toast.error(error.message);
		},
	});

	// tRPC Mutation for Deleting an Answer
	const deleteAnswerMutation = api.quizzCreator.answer.deleteAnswer.useMutation({
		onSuccess: async () => {
			await utils.quizzCreator.answer.getAllAnswers.invalidate({ questionId });
			setIsDeleteConfirmOpen(false);
			setAnswerToDeleteId(null);
			toast.success('Answer deleted successfully!');
		},
		onError: error => {
			console.error('Failed to delete answer:', error);
			toast.error(error.message);
		},
	});

	const handleCreateAnswer = () => {
		if (!newAnswerText.trim()) {
			toast.error('Answer text cannot be empty.');
			return;
		}
		if (newAnswerOrder < 0) {
			toast.error('Answer order must be a non-negative number.');
			return;
		}

		createAnswerMutation.mutate({
			questionId: questionId,
			text: newAnswerText,
			isCorrect: newAnswerIsCorrect,
			order: newAnswerOrder,
			nextQuestionId: null, // Not implementing branching logic for now
		});
	};

	const handleUpdateAnswer = () => {
		if (!answerToEdit) {
			toast.error('No answer selected for editing.');
			return;
		}
		if (!editAnswerText.trim()) {
			toast.error('Answer text cannot be empty.');
			return;
		}
		if (editAnswerOrder < 0) {
			toast.error('Answer order must be a non-negative number.');
			return;
		}

		updateAnswerMutation.mutate({
			id: answerToEdit.id,
			text: editAnswerText,
			isCorrect: editAnswerIsCorrect,
			order: editAnswerOrder,
			// nextQuestionId can be added if needed for editing branching logic
		});
	};

	const handleConfirmDelete = () => {
		if (!answerToDeleteId) {
			toast.error('No answer selected for deletion.');
			return;
		}
		deleteAnswerMutation.mutate({ id: answerToDeleteId });
	};

	// useEffect to set initial order when answers data is available
	useEffect(() => {
		if (answers) {
			setNewAnswerOrder(answers.length);
		}
	}, [answers]);

	if (!quizzId || !questionId) {
		return <p className='p-4'>Quizz ID or Question ID not found in URL.</p>;
	}

	return (
		<div className='container mx-auto p-4 md:p-8'>
			<header className='mb-8'>
				<Button asChild variant='outline' className='mb-4'>
					<Link href={`/dashboard/quizz/${quizzId}/questions`}>Back to Questions</Link>
				</Button>
				{isLoadingQuestion && <p className='text-lg text-muted-foreground'>Loading question details...</p>}
				{isErrorQuestion && (
					<p className='text-lg text-red-500'>Error loading question: {questionError?.message}</p>
				)}
				{questionDetails && (
					<h1 className='text-3xl font-bold'>Manage Answers for: "{questionDetails.text}"</h1>
				)}
				{!questionDetails && !isLoadingQuestion && !isErrorQuestion && (
					<h1 className='text-3xl font-bold'>Manage Answers for Question ID: {questionId}</h1>
				)}
				<p className='text-sm text-muted-foreground'>Part of Quizz ID: {quizzId}</p>

				<Dialog open={isCreateAnswerDialogOpen} onOpenChange={setIsCreateAnswerDialogOpen}>
					<DialogTrigger asChild>
						<Button className='mt-4'>Add New Answer</Button>
					</DialogTrigger>
					<DialogContent className='sm:max-w-[425px]'>
						<DialogHeader>
							<DialogTitle>Add New Answer</DialogTitle>
							<DialogDescription>
								Provide the text for the answer and indicate if it's correct.
							</DialogDescription>
						</DialogHeader>
						<div className='grid gap-4 py-4'>
							<div className='grid grid-cols-4 items-center gap-4'>
								<Label htmlFor='answerText' className='text-right'>
									Answer Text
								</Label>
								<Textarea
									id='answerText'
									value={newAnswerText}
									onChange={e => setNewAnswerText(e.target.value)}
									className='col-span-3'
									placeholder='Enter answer text...'
								/>
							</div>
							<div className='grid grid-cols-4 items-center gap-4'>
								<Label htmlFor='answerOrder' className='text-right'>
									Order
								</Label>
								<Input
									id='answerOrder'
									type='number'
									value={newAnswerOrder}
									onChange={e => setNewAnswerOrder(parseInt(e.target.value, 10))}
									className='col-span-3'
								/>
							</div>
							<div className='grid grid-cols-4 items-center gap-4'>
								<Label htmlFor='answerIsCorrect' className='text-right'>
									Is Correct?
								</Label>
								<div className='col-span-3 flex items-center'>
									<Checkbox
										id='answerIsCorrect'
										checked={newAnswerIsCorrect}
										onCheckedChange={checked => setNewAnswerIsCorrect(checked as boolean)}
									/>
								</div>
							</div>
						</div>
						<DialogFooter>
							<Button
								type='button'
								variant={'outline'}
								onClick={() => setIsCreateAnswerDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button
								type='submit'
								onClick={handleCreateAnswer}
								disabled={createAnswerMutation.isPending}
							>
								{createAnswerMutation.isPending ? 'Saving...' : 'Save Answer'}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</header>

			<section className='mt-8'>
				<h2 className='text-2xl font-semibold mb-4'>Existing Answers ({answers?.length || 0})</h2>
				{isLoadingAnswers && <p className='text-muted-foreground'>Loading answers...</p>}
				{isErrorAnswers && <p className='text-red-500'>Error loading answers: {answersError?.message}</p>}
				{answers && answers.length === 0 && !isLoadingAnswers && (
					<p className='text-muted-foreground'>No answers found for this question yet.</p>
				)}
				{answers && answers.length > 0 && (
					<ul className='space-y-3'>
						{answers
							.sort((a, b) => a.order - b.order)
							.map(answer => (
								<li key={answer.id} className='p-4 border rounded-md shadow-sm bg-card'>
									<div className='flex justify-between items-center'>
										<div>
											<p className='font-medium'>{answer.text}</p>
											<p
												className={`text-sm ${
													answer.isCorrect ? 'text-green-600' : 'text-red-600'
												}`}
											>
												{answer.isCorrect ? 'Correct' : 'Incorrect'}
											</p>
											<p className='text-xs text-muted-foreground'>Order: {answer.order}</p>
										</div>
										<div>
											<Button
												variant='outline'
												size='sm'
												onClick={() => {
													setAnswerToEdit(answer);
													setEditAnswerText(answer.text);
													setEditAnswerIsCorrect(answer.isCorrect);
													setEditAnswerOrder(answer.order);
													setIsEditAnswerDialogOpen(true);
												}}
											>
												Edit
											</Button>
											<Button
												variant='destructive'
												size='sm'
												className='ml-2'
												onClick={() => {
													setAnswerToDeleteId(answer.id);
													setIsDeleteConfirmOpen(true);
												}}
												disabled={deleteAnswerMutation.isPending}
											>
												Delete
											</Button>
										</div>
									</div>
								</li>
							))}
					</ul>
				)}
			</section>

			{/* Edit Answer Dialog */}
			<Dialog
				open={isEditAnswerDialogOpen}
				onOpenChange={isOpen => {
					setIsEditAnswerDialogOpen(isOpen);
					if (!isOpen) setAnswerToEdit(null); // Reset answerToEdit when dialog closes
				}}
			>
				<DialogContent className='sm:max-w-[425px]'>
					<DialogHeader>
						<DialogTitle>Edit Answer</DialogTitle>
						<DialogDescription>Update the details for this answer.</DialogDescription>
					</DialogHeader>
					{answerToEdit && (
						<div className='grid gap-4 py-4'>
							<div className='grid grid-cols-4 items-center gap-4'>
								<Label htmlFor='editAnswerText' className='text-right'>
									Answer Text
								</Label>
								<Textarea
									id='editAnswerText'
									value={editAnswerText}
									onChange={e => setEditAnswerText(e.target.value)}
									className='col-span-3'
								/>
							</div>
							<div className='grid grid-cols-4 items-center gap-4'>
								<Label htmlFor='editAnswerOrder' className='text-right'>
									Order
								</Label>
								<Input
									id='editAnswerOrder'
									type='number'
									value={editAnswerOrder}
									onChange={e => setEditAnswerOrder(parseInt(e.target.value, 10))}
									className='col-span-3'
								/>
							</div>
							<div className='grid grid-cols-4 items-center gap-4'>
								<Label htmlFor='editAnswerIsCorrect' className='text-right'>
									Is Correct?
								</Label>
								<div className='col-span-3 flex items-center'>
									<Checkbox
										id='editAnswerIsCorrect'
										checked={editAnswerIsCorrect}
										onCheckedChange={checked => setEditAnswerIsCorrect(checked as boolean)}
									/>
								</div>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button
							type='button'
							variant={'outline'}
							onClick={() => {
								setIsEditAnswerDialogOpen(false);
								setAnswerToEdit(null);
							}}
						>
							Cancel
						</Button>
						<Button type='submit' onClick={handleUpdateAnswer} disabled={updateAnswerMutation.isPending}>
							{updateAnswerMutation.isPending ? 'Saving...' : 'Save Changes'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Answer Confirmation Dialog */}
			<AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the answer.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setAnswerToDeleteId(null)}>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleConfirmDelete} disabled={deleteAnswerMutation.isPending}>
							{deleteAnswerMutation.isPending ? 'Deleting...' : 'Delete'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
