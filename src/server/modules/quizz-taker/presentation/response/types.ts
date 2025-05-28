import { z } from 'zod';

export const ResponseOutput = z.object({
	id: z.string().uuid(),
	attemptId: z.string().uuid(),
	questionId: z.string().uuid(),
	answerId: z.string().uuid(),
});
export type ResponseOutput = z.infer<typeof ResponseOutput>;

export const SaveResponseCommandProps = z.object({
	attemptId: z.string().uuid('Attempt ID must be a valid UUID'),
	questionId: z.string().uuid('Question ID must be a valid UUID'),
	answerId: z.string().uuid('Answer ID must be a valid UUID'),
	quizzId: z.string().uuid('Quizz ID must be a valid UUID'),
	playerId: z.string().uuid('Player ID must be a valid UUID'),
	timeTakenMs: z.number().min(0, 'Time taken must be a non-negative integer.'),
});
export type SaveResponseCommandProps = z.infer<typeof SaveResponseCommandProps>;
