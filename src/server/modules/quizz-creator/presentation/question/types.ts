import { z } from 'zod';

export const QuestionOutput = z.object({
	id: z.string().uuid(),
	quizzId: z.string().uuid(),
	text: z.string(),
	order: z.number().int(),
	imageUrl: z.string().nullable(),
});
export type QuestionOutput = z.infer<typeof QuestionOutput>;
