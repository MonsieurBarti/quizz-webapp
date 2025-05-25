'use client';

import { useParams } from 'next/navigation';
import { api } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
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
import { toast } from 'sonner';

import { type inferRouterOutputs } from '@trpc/server';
import { type AppRouter } from '@/server/api/root'; // Adjust this path if your AppRouter is located elsewhere

// Define the type for a Question using tRPC output inference
type RouterOutput = inferRouterOutputs<AppRouter>;
type QuestionOutput = RouterOutput['quizzCreator']['question']['getAllQuestions'][number];

export default function ManageQuizQuestionsPage() {
	const params = useParams();
	const quizzId = params.quizzId as string; // Type assertion
	console.log('ManageQuestionsPage - quizzId:', quizzId);
	const utils = api.useUtils(); // Get tRPC utils for cache invalidation

	// Fetch quiz details (optional, if needed for context like quiz title)
	const quizzDetailsQuery = api.quizzCreator.quizz.getQuizzById.useQuery(
		{ id: quizzId },
		{
			enabled: !!quizzId,
		},
	);
	console.log('ManageQuestionsPage - quizzDetailsQuery:', quizzDetailsQuery);

	const questionsQuery = api.quizzCreator.question.getAllQuestions.useQuery(
		{ quizzId: quizzId },
		{
			enabled: !!quizzId, // Only run query if quizzId is available
		},
	);

	const [isCreateQuestionDialogOpen, setIsCreateQuestionDialogOpen] = useState(false);
	const [newQuestionText, setNewQuestionText] = useState('');
	const [newQuestionOrder, setNewQuestionOrder] = useState(0); // Or determine dynamically
	const [newQuestionImageUrl, setNewQuestionImageUrl] = useState('');

	// State for Edit Question Dialog
	const [isEditQuestionDialogOpen, setIsEditQuestionDialogOpen] = useState(false);
	const [questionToEdit, setQuestionToEdit] = useState<QuestionOutput | null>(null);
	const [editQuestionText, setEditQuestionText] = useState('');
	const [editQuestionOrder, setEditQuestionOrder] = useState(0);
	const [editQuestionImageUrl, setEditQuestionImageUrl] = useState('');

	// State for Delete Question Confirmation
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
	const [questionToDeleteId, setQuestionToDeleteId] = useState<string | null>(null);

	const createQuestionMutation = api.quizzCreator.question.createQuestion.useMutation({
		onSuccess: async () => {
			// Invalidate and refetch questions for this quizz
			await utils.quizzCreator.question.getAllQuestions.invalidate({ quizzId });
			setIsCreateQuestionDialogOpen(false); // Close dialog
			// Reset form fields
			setNewQuestionText('');
			setNewQuestionOrder(questionsQuery.data?.length || 0); // Reset order to next available
			setNewQuestionImageUrl('');
			toast.success('Question created successfully!');
		},
		onError: error => {
			console.error('Failed to create question:', error);
			toast.error(error.message);
		},
	});

	// tRPC Mutation for Updating a Question
	const updateQuestionMutation = api.quizzCreator.question.updateQuestion.useMutation({
		onSuccess: async () => {
			await utils.quizzCreator.question.getAllQuestions.invalidate({ quizzId });
			// If you have a getQuestionById query, invalidate it too
			if (questionToEdit) {
				await utils.quizzCreator.question.getQuestionById.invalidate({ id: questionToEdit.id });
			}
			setIsEditQuestionDialogOpen(false);
			setQuestionToEdit(null);
			toast.success('Question updated successfully!');
		},
		onError: error => {
			console.error('Failed to update question:', error);
			toast.error(error.message);
		},
	});

	// tRPC Mutation for Deleting a Question
	const deleteQuestionMutation = api.quizzCreator.question.deleteQuestion.useMutation({
		onSuccess: async () => {
			await utils.quizzCreator.question.getAllQuestions.invalidate({ quizzId });
			setIsDeleteConfirmOpen(false);
			setQuestionToDeleteId(null);
			toast.success('Question deleted successfully!');
		},
		onError: error => {
			console.error('Failed to delete question:', error);
			toast.error(error.message);
		},
	});

	const handleCreateQuestion = () => {
		if (!newQuestionText.trim()) {
			alert('Question text cannot be empty.'); // Simple validation
			return;
		}
		if (newQuestionOrder < 0) {
			alert('Question order must be a non-negative number.');
			return;
		}

		createQuestionMutation.mutate({
			quizzId: quizzId,
			text: newQuestionText,
			order: newQuestionOrder,
			imageUrl: newQuestionImageUrl.trim() || null, // Send null if empty
		});
	};

	const handleUpdateQuestion = () => {
		if (!questionToEdit) {
			toast.error('No question selected for editing.');
			return;
		}
		if (!editQuestionText.trim()) {
			toast.error('Question text cannot be empty.');
			return;
		}
		if (editQuestionOrder < 0) {
			toast.error('Question order must be a non-negative number.');
			return;
		}

		updateQuestionMutation.mutate({
			id: questionToEdit.id,
			text: editQuestionText,
			order: editQuestionOrder,
			imageUrl: editQuestionImageUrl.trim() || null,
		});
	};

	const handleDeleteQuestion = () => {
		if (!questionToDeleteId) {
			toast.error('No question selected for deletion.');
			return;
		}

		deleteQuestionMutation.mutate({
			id: questionToDeleteId,
		});
	};

	// Effect to set initial order when questions data is available
	useEffect(() => {
		if (questionsQuery.data) {
			setNewQuestionOrder(questionsQuery.data.length);
		}
	}, [questionsQuery.data]);

	if (!quizzId) {
		return <p className='p-4'>Quizz ID not found.</p>;
	}

	if (questionsQuery.isLoading || quizzDetailsQuery.isLoading) {
		return <p className='p-4'>Loading...</p>;
	}

	if (questionsQuery.error) {
		return <p className='p-4 text-red-500'>Error loading questions: {questionsQuery.error.message}</p>;
	}

	if (quizzDetailsQuery.error) {
		return <p className='p-4 text-red-500'>Error loading quizz details: {quizzDetailsQuery.error.message}</p>;
	}

	// Additional check for when data is explicitly null (e.g., quizz not found)
	if (quizzDetailsQuery.isSuccess && !quizzDetailsQuery.data) {
		return (
			<p className='p-4 text-orange-500'>
				Quizz details not found. It might have been deleted or the ID is incorrect.
			</p>
		);
	}

	return (
		<div className='container mx-auto p-4 md:p-8'>
			<header className='mb-8'>
				<Button asChild variant='outline' className='mb-4'>
					<Link href='/dashboard'>Back to Dashboard</Link>
				</Button>
				{quizzDetailsQuery.data && (
					<h1 className='text-3xl font-bold'>Manage Questions for: {quizzDetailsQuery.data.title}</h1>
				)}
				{!quizzDetailsQuery.data && (
					<h1 className='text-3xl font-bold'>
						Manage Questions for Quizz:{' '}
						<span className='text-sm font-mono bg-muted p-1 rounded'>{quizzId}</span>
					</h1>
				)}
				{/* TODO: Add "Create New Question" Button/Dialog here */}
				<Dialog open={isCreateQuestionDialogOpen} onOpenChange={setIsCreateQuestionDialogOpen}>
					<DialogTrigger asChild>
						<Button className='mt-4'>Add New Question</Button>
					</DialogTrigger>
					<DialogContent className='sm:max-w-[425px]'>
						<DialogHeader>
							<DialogTitle>Add New Question</DialogTitle>
							<DialogDescription>Fill in the details for the new question.</DialogDescription>
						</DialogHeader>
						<div className='grid gap-4 py-4'>
							<div className='grid grid-cols-4 items-center gap-4'>
								<Label htmlFor='questionText' className='text-right'>
									Text
								</Label>
								<Textarea
									id='questionText'
									value={newQuestionText}
									onChange={e => setNewQuestionText(e.target.value)}
									className='col-span-3'
									placeholder='Enter question text...'
								/>
							</div>
							<div className='grid grid-cols-4 items-center gap-4'>
								<Label htmlFor='questionOrder' className='text-right'>
									Order
								</Label>
								<Input
									id='questionOrder'
									type='number'
									value={newQuestionOrder}
									onChange={e => setNewQuestionOrder(parseInt(e.target.value, 10))}
									className='col-span-3'
								/>
							</div>
							<div className='grid grid-cols-4 items-center gap-4'>
								<Label htmlFor='questionImageUrl' className='text-right'>
									Image URL (Optional)
								</Label>
								<Input
									id='questionImageUrl'
									value={newQuestionImageUrl}
									onChange={e => setNewQuestionImageUrl(e.target.value)}
									className='col-span-3'
									placeholder='https://example.com/image.png'
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								type='button'
								variant={'outline'}
								onClick={() => setIsCreateQuestionDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button
								type='submit'
								onClick={handleCreateQuestion}
								disabled={createQuestionMutation.isPending}
							>
								{createQuestionMutation.isPending ? 'Saving...' : 'Save Question'}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</header>

			<section>
				<h2 className='mb-4 text-2xl font-semibold'>Questions</h2>
				{questionsQuery.data && questionsQuery.data.length === 0 && (
					<p className='text-muted-foreground'>No questions added to this quiz yet.</p>
				)}
				{questionsQuery.data && questionsQuery.data.length > 0 && (
					<div className='space-y-6'>
						{questionsQuery.data.map((question, index) => (
							<div
								key={question.id}
								className='rounded-lg border bg-card p-6 text-card-foreground shadow-sm'
							>
								<div className='flex items-center justify-between'>
									<h3 className='text-xl font-semibold'>
										{index + 1}. {question.text}
									</h3>
									{/* TODO: Add Edit/Delete Question buttons */}
									<div>
										<Button
											variant='outline'
											size='sm'
											className='mr-2'
											onClick={() => {
												setIsEditQuestionDialogOpen(true);
												setQuestionToEdit(question);
												setEditQuestionText(question.text);
												setEditQuestionOrder(question.order);
												setEditQuestionImageUrl(question.imageUrl || '');
											}}
										>
											Edit
										</Button>
										<Button
											variant='destructive'
											size='sm'
											onClick={() => {
												setIsDeleteConfirmOpen(true);
												setQuestionToDeleteId(question.id);
											}}
										>
											Delete
										</Button>
									</div>
								</div>
								{question.imageUrl && (
									<div className='mt-4'>
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={question.imageUrl}
											alt={`Question ${index + 1} image`}
											className='max-h-48 rounded-md object-contain'
										/>
									</div>
								)}
								{/* TODO: Display Answers for this question */}
								<div className='mt-4'>
									<h4 className='text-md font-semibold mb-2'>Answers:</h4>
									<p className='text-sm text-muted-foreground'>
										This question needs answers managed.
									</p>
									<Button asChild variant='link' size='sm' className='mt-2 p-0 h-auto'>
										<Link href={`/dashboard/quizz/${quizzId}/questions/${question.id}/answers`}>
											Manage Answers
										</Link>
									</Button>
								</div>
							</div>
						))}
					</div>
				)}
			</section>
			<Dialog open={isEditQuestionDialogOpen} onOpenChange={setIsEditQuestionDialogOpen}>
				<DialogContent className='sm:max-w-[425px]'>
					<DialogHeader>
						<DialogTitle>Edit Question</DialogTitle>
						<DialogDescription>Edit the details for the question.</DialogDescription>
					</DialogHeader>
					<div className='grid gap-4 py-4'>
						<div className='grid grid-cols-4 items-center gap-4'>
							<Label htmlFor='editQuestionText' className='text-right'>
								Text
							</Label>
							<Textarea
								id='editQuestionText'
								value={editQuestionText}
								onChange={e => setEditQuestionText(e.target.value)}
								className='col-span-3'
								placeholder='Enter question text...'
							/>
						</div>
						<div className='grid grid-cols-4 items-center gap-4'>
							<Label htmlFor='editQuestionOrder' className='text-right'>
								Order
							</Label>
							<Input
								id='editQuestionOrder'
								type='number'
								value={editQuestionOrder}
								onChange={e => setEditQuestionOrder(parseInt(e.target.value, 10))}
								className='col-span-3'
							/>
						</div>
						<div className='grid grid-cols-4 items-center gap-4'>
							<Label htmlFor='editQuestionImageUrl' className='text-right'>
								Image URL (Optional)
							</Label>
							<Input
								id='editQuestionImageUrl'
								value={editQuestionImageUrl}
								onChange={e => setEditQuestionImageUrl(e.target.value)}
								className='col-span-3'
								placeholder='https://example.com/image.png'
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type='button' variant={'outline'} onClick={() => setIsEditQuestionDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							type='submit'
							onClick={handleUpdateQuestion}
							disabled={updateQuestionMutation.isPending}
						>
							{updateQuestionMutation.isPending ? 'Saving...' : 'Save Question'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the question and all its
							associated answers.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							onClick={() => {
								setIsDeleteConfirmOpen(false);
								setQuestionToDeleteId(null);
							}}
						>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction onClick={handleDeleteQuestion} disabled={deleteQuestionMutation.isPending}>
							{deleteQuestionMutation.isPending ? 'Deleting...' : 'Delete Question'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
