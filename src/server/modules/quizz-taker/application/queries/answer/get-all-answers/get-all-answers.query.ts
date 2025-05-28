import { z } from 'zod';
import { injectable } from 'inversify';
import { db } from '@/server/db';
import { eq } from 'drizzle-orm';
import { answer } from '@/server/db/schema';

export const GetAllAnswersQueryProps = z.object({
	questionId: z.string().uuid(),
});

export type GetAllAnswersQueryProps = z.infer<typeof GetAllAnswersQueryProps>;

export class GetAllAnswersQuery {
	constructor(public readonly props: GetAllAnswersQueryProps) {}
}

@injectable()
export class GetAllAnswersQueryHandler {
	public async execute({ props }: GetAllAnswersQuery) {
		const results = await db.query.answer.findMany({
			where: eq(answer.questionId, props.questionId),
		});
		return results;
	}
}
