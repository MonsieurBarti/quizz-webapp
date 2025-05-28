import { z } from 'zod';
import { injectable } from 'inversify';
import { db } from '@/server/db';
import { eq } from 'drizzle-orm';
import { quizz } from '@/server/db/schema';

export const GetAllQuizzQueryProps = z.void();

export type GetAllQuizzQueryProps = z.infer<typeof GetAllQuizzQueryProps>;

export class GetAllQuizzQuery {
	constructor(public readonly _props: GetAllQuizzQueryProps) {}
}

@injectable()
export class GetAllQuizzQueryHandler {
	public async execute() {
		const results = await db.query.quizz.findMany({
			where: eq(quizz.isPublished, true),
			with: { createdBy: { columns: { name: true } } },
		});
		return results;
	}
}
