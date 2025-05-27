import { z } from 'zod';

export const AnswerOutput = z.object({
	id: z.string().uuid(),
	text: z.string(),
	order: z.number().int(),
	updatedAt: z.date(),
});
export type AnswerOutput = z.infer<typeof AnswerOutput>;

export const GetAllAnswersQueryProps = z.object({
	questionId: z.string().uuid(),
});
export type GetAllAnswersQueryProps = z.infer<typeof GetAllAnswersQueryProps>;

export const GetAnswerByIdQueryProps = z.object({
	id: z.string().uuid(),
});
export type GetAnswerByIdQueryProps = z.infer<typeof GetAnswerByIdQueryProps>;
