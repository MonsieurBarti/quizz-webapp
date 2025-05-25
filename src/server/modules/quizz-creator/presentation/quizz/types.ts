import { z } from 'zod';

export const QuizzOutput = z.object({
	id: z.string().uuid(),
	title: z.string(),
	description: z.string().nullable(),
	isPublished: z.boolean(),
	createdBy: z.string().uuid(),
});
export type QuizzOutput = z.infer<typeof QuizzOutput>;
