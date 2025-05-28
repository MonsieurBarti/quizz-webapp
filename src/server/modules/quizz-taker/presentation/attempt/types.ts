import { z } from 'zod';

export const AttemptOutput = z.object({
	id: z.string().uuid(),
	quizzId: z.string().uuid(),
	playerId: z.string().uuid(),
});
export type AttemptOutput = z.infer<typeof AttemptOutput>;

export const SaveAttemptCommandProps = z.object({
	quizzId: z.string().uuid('Quizz ID must be a valid UUID'),
	playerId: z.string().uuid('Player ID must be a valid UUID'),
	isCorrect: z.boolean().optional(),
	completedAt: z.coerce.date().optional(),
});
export type SaveAttemptCommandProps = z.infer<typeof SaveAttemptCommandProps>;
