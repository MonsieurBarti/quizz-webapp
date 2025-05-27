import { z } from 'zod';

export const QuestionOutput = z.object({
	id: z.string().uuid(),
	quizzId: z.string().uuid(),
	text: z.string(),
	order: z.number().int(),
	imageUrl: z.string().nullable(),
	updatedAt: z.date(),
});
export type QuestionOutput = z.infer<typeof QuestionOutput>;

export const GetAllQuestionsQueryProps = z.object({
	quizzId: z.string().uuid(),
});
export type GetAllQuestionsQueryProps = z.infer<typeof GetAllQuestionsQueryProps>;

export const GetQuestionByIdQueryProps = z.object({
	id: z.string().uuid(),
});
export type GetQuestionByIdQueryProps = z.infer<typeof GetQuestionByIdQueryProps>;
