import { z } from 'zod';
import { injectable } from 'inversify';
import { db } from '@/server/db';
import { eq } from 'drizzle-orm';
import { question } from '@/server/db/schema';
import { QuestionNotFound } from '@/server/modules/quizz-taker/domain/errors/quizz-taker.errors';

export const GetQuestionByIdQueryProps = z.object({
	id: z.string().uuid(),
});

export type GetQuestionByIdQueryProps = z.infer<typeof GetQuestionByIdQueryProps>;

export class GetQuestionByIdQuery {
	constructor(public readonly props: GetQuestionByIdQueryProps) {}
}

@injectable()
export class GetQuestionByIdQueryHandler {
	public async execute({ props }: GetQuestionByIdQuery) {
		const result = await db.query.question.findFirst({
			where: eq(question.id, props.id),
		});
		if (!result) {
			throw new QuestionNotFound(props.id);
		}
		return result;
	}
}
