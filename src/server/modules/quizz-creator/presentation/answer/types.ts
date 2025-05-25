import { z } from 'zod';

export const AnswerOutput = z.object({
	id: z.string().uuid(),
	questionId: z.string().uuid(),
	text: z.string(),
	isCorrect: z.boolean(),
	order: z.number().int(),
	nextQuestionId: z.string().uuid().nullable(),
});
export type AnswerOutput = z.infer<typeof AnswerOutput>;
