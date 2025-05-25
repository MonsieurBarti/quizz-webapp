'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/trpc/react';
import Link from 'next/link';
import { toast } from 'sonner';

import { type inferRouterOutputs } from '@trpc/server';
import { type AppRouter } from '@/server/api/root'; // Adjust this path if your AppRouter is located elsewhere

type RouterOutput = inferRouterOutputs<AppRouter>;
type QuizzOutput = RouterOutput['quizzCreator']['quizz']['getAllQuizz'][number];

export default function DashboardPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const utils = api.useUtils();

	const [isCreateQuizDialogOpen, setIsCreateQuizDialogOpen] = useState(false);
	const [newQuizTitle, setNewQuizTitle] = useState('');
	const [newQuizDescription, setNewQuizDescription] = useState('');

	// State for Edit Quiz Dialog
	const [isEditQuizDialogOpen, setIsEditQuizDialogOpen] = useState(false);
	const [quizToEdit, setQuizToEdit] = useState<QuizzOutput | null>(null); 
	const [editQuizTitle, setEditQuizTitle] = useState('');
	const [editQuizDescription, setEditQuizDescription] = useState('');

	// State for Delete Quiz Confirmation
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
	const [quizToDeleteId, setQuizToDeleteId] = useState<string | null>(null);

	useEffect(() => {
		if (status === 'unauthenticated') {
			router.push('/');
		}
	}, [status, router]);

	const quizzesQuery = api.quizzCreator.quizz.getAllQuizz.useQuery(undefined, {
		enabled: status === 'authenticated',
	});

	const createQuizMutation = api.quizzCreator.quizz.createQuizz.useMutation({
		onSuccess: () => {
			toast.success('Quiz created successfully!');
			utils.quizzCreator.quizz.getAllQuizz.invalidate();
			setIsCreateQuizDialogOpen(false);
			setNewQuizTitle('');
			setNewQuizDescription('');
		},
		onError: error => {
			console.error('Failed to create quiz:', error);
			toast.error(error.message);
		},
	});

	const updateQuizMutation = api.quizzCreator.quizz.updateQuizz.useMutation({
		onSuccess: async () => {
			toast.success('Quiz updated successfully!');
			await utils.quizzCreator.quizz.getAllQuizz.invalidate();
			if (quizToEdit) {
				await utils.quizzCreator.quizz.getQuizzById.invalidate({ id: quizToEdit.id });
			}
			setIsEditQuizDialogOpen(false);
			setQuizToEdit(null);
		},
		onError: error => {
			console.error('Failed to update quiz:', error);
			toast.error(error.message);
		},
	});

	const deleteQuizMutation = api.quizzCreator.quizz.deleteQuizz.useMutation({
		onSuccess: async () => {
			toast.success('Quiz deleted successfully!');
			await utils.quizzCreator.quizz.getAllQuizz.invalidate();
			setIsDeleteConfirmOpen(false);
			setQuizToDeleteId(null);
		},
		onError: error => {
			console.error('Failed to delete quiz:', error);
			toast.error(error.message);
		},
	});

	const handleCreateQuizSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!newQuizTitle.trim()) {
			alert('Title is required.');
			return;
		}
		createQuizMutation.mutate({ title: newQuizTitle, description: newQuizDescription });
	};

	const handleUpdateQuizSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!quizToEdit) {
			toast.error('No quiz selected for editing.');
			return;
		}
		if (!editQuizTitle.trim()) {
			toast.error('Title is required.');
			return;
		}
		updateQuizMutation.mutate({
			id: quizToEdit.id,
			title: editQuizTitle,
			description: editQuizDescription,
		});
	};

	const handleDeleteQuizConfirm = () => {
		if (!quizToDeleteId) {
			toast.error('No quiz selected for deletion.');
			return;
		}
		deleteQuizMutation.mutate({ id: quizToDeleteId });
	};

	if (status === 'loading') {
		return <p className='p-4'>Loading dashboard...</p>;
	}

	if (status === 'unauthenticated' || !session) {
		return <p className='p-4'>Access Denied. Please log in.</p>;
	}

	return (
		<div className='container mx-auto p-4 md:p-8'>
			<header className='mb-8 flex items-center justify-between'>
				<h1 className='text-3xl font-bold'>Quiz Dashboard</h1>
				<Dialog open={isCreateQuizDialogOpen} onOpenChange={setIsCreateQuizDialogOpen}>
					<DialogTrigger asChild>
						<Button>Create New Quiz</Button>
					</DialogTrigger>
					<DialogContent className='sm:max-w-[425px]'>
						<DialogHeader>
							<DialogTitle>Create New Quiz</DialogTitle>
							<DialogDescription>
								Fill in the details for your new quiz. Click save when you're done.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleCreateQuizSubmit}>
							<div className='grid gap-4 py-4'>
								<div className='grid grid-cols-4 items-center gap-4'>
									<Label htmlFor='title' className='text-right'>
										Title
									</Label>
									<Input
										id='title'
										value={newQuizTitle}
										onChange={e => setNewQuizTitle(e.target.value)}
										className='col-span-3'
										required
									/>
								</div>
								<div className='grid grid-cols-4 items-center gap-4'>
									<Label htmlFor='description' className='text-right'>
										Description
									</Label>
									<Textarea
										id='description'
										value={newQuizDescription}
										onChange={e => setNewQuizDescription(e.target.value)}
										className='col-span-3'
										placeholder='Optional: A brief description of your quiz'
									/>
								</div>
							</div>
							<DialogFooter>
								<Button type='submit' disabled={createQuizMutation.isPending}>
									{createQuizMutation.isPending ? 'Saving...' : 'Save Quiz'}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</header>

			<section>
				<h2 className='mb-4 text-2xl font-semibold'>Your Quizzes</h2>
				{quizzesQuery.isLoading && <p className='text-muted-foreground'>Loading quizzes...</p>}
				{quizzesQuery.error && (
					<p className='text-red-500'>Error loading quizzes: {quizzesQuery.error.message}</p>
				)}
				{quizzesQuery.data && quizzesQuery.data.length === 0 && (
					<p className='text-muted-foreground'>
						No quizzes created yet. Click "Create New Quiz" to get started!
					</p>
				)}
				{quizzesQuery.data && quizzesQuery.data.length > 0 && (
					<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
						{quizzesQuery.data.map(quiz => (
							<Card key={quiz.id} className='flex flex-col'>
								<CardHeader>
									<CardTitle>{quiz.title}</CardTitle>
									{quiz.description && <CardDescription>{quiz.description}</CardDescription>}
								</CardHeader>
								<CardContent className='flex-grow'>
									<p className={`text-xs ${quiz.isPublished ? 'text-green-500' : 'text-yellow-500'}`}>
										{quiz.isPublished ? 'Published' : 'Draft'}
									</p>
								</CardContent>
								<CardFooter className='flex-col items-start gap-2'>
									<Button asChild variant='outline' size='sm' className='w-full'>
										<Link href={`/dashboard/quizz/${quiz.id}/questions`}>Manage Questions</Link>
									</Button>
									<div className='flex w-full gap-2 mt-2'>
										<Button
											variant='secondary'
											size='sm'
											className='flex-1'
											onClick={() => {
												setQuizToEdit(quiz);
												setEditQuizTitle(quiz.title);
												setEditQuizDescription(quiz.description || '');
												setIsEditQuizDialogOpen(true);
											}}
										>
											Edit
										</Button>
										<Button
											variant='destructive'
											size='sm'
											className='flex-1'
											onClick={() => {
												setQuizToDeleteId(quiz.id);
												setIsDeleteConfirmOpen(true);
											}}
										>
											Delete
										</Button>
									</div>
								</CardFooter>
							</Card>
						))}
					</div>
				)}
			</section>

			{/* Edit Quiz Dialog */}
			<Dialog open={isEditQuizDialogOpen} onOpenChange={setIsEditQuizDialogOpen}>
				<DialogContent className='sm:max-w-[425px]'>
					<DialogHeader>
						<DialogTitle>Edit Quiz</DialogTitle>
						<DialogDescription>
							Update the details for your quiz. Click save when you're done.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleUpdateQuizSubmit}>
						<div className='grid gap-4 py-4'>
							<div className='grid grid-cols-4 items-center gap-4'>
								<Label htmlFor='edit-title' className='text-right'>
									Title
								</Label>
								<Input
									id='edit-title'
									value={editQuizTitle}
									onChange={e => setEditQuizTitle(e.target.value)}
									className='col-span-3'
									required
								/>
							</div>
							<div className='grid grid-cols-4 items-center gap-4'>
								<Label htmlFor='edit-description' className='text-right'>
									Description
								</Label>
								<Textarea
									id='edit-description'
									value={editQuizDescription}
									onChange={e => setEditQuizDescription(e.target.value)}
									className='col-span-3'
									placeholder='Optional: A brief description of your quiz'
								/>
							</div>
						</div>
						<DialogFooter>
							<Button type='button' variant={'outline'} onClick={() => setIsEditQuizDialogOpen(false)}>
								Cancel
							</Button>
							<Button type='submit' disabled={updateQuizMutation.isPending}>
								{updateQuizMutation.isPending ? 'Saving...' : 'Save Changes'}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Delete Quiz Confirmation Dialog */}
			<AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the quiz and all its associated questions and answers.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => {
							setIsDeleteConfirmOpen(false);
							setQuizToDeleteId(null);
						}}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction onClick={handleDeleteQuizConfirm} disabled={deleteQuizMutation.isPending}>
							{deleteQuizMutation.isPending ? 'Deleting...' : 'Delete Quiz'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
