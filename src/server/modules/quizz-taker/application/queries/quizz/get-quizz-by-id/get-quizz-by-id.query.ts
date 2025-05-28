import { z } from 'zod';
import { injectable } from 'inversify';
import { db } from '@/server/db';
import { eq } from 'drizzle-orm';
import { quizz } from '@/server/db/schema';
import { QuizzNotFound } from '@/server/modules/quizz-taker/domain/errors/quizz-taker.errors';

export const GetQuizzByIdQueryProps = z.object({
	id: z.string().uuid(),
});

export type GetQuizzByIdQueryProps = z.infer<typeof GetQuizzByIdQueryProps>;

export class GetQuizzByIdQuery {
	constructor(public readonly props: GetQuizzByIdQueryProps) {}
}

@injectable()
export class GetQuizzByIdQueryHandler {
	public async execute({ props }: GetQuizzByIdQuery) {
		const result = await db.query.quizz.findFirst({
			where: eq(quizz.id, props.id),
			with: { createdBy: { columns: { name: true } } },
		});
		if (!result) {
			throw new QuizzNotFound(props.id);
		}
		return result;
	}
}
