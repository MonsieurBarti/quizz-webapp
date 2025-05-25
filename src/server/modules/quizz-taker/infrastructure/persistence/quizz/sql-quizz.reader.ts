import { injectable } from 'inversify';
import { and, eq } from 'drizzle-orm';
import type { Quizz } from '@quizz-taker/domain/quizz/quizz';
import type { QuizzReader } from '@quizz-taker/domain/quizz/quizz.reader';
import { QuizzMapper } from './quizz.mapper';
import { quizz as quizzTable } from '@/server/db/schema';
import { db } from '@/server/db';

@injectable()
export class SqlQuizzReader implements QuizzReader {
	async findById({ id }: { id: string }): Promise<Quizz | null> {
		const result = await db.query.quizz.findFirst({
			where: and(eq(quizzTable.id, id), eq(quizzTable.isPublished, true)),
		});
		return result ? QuizzMapper.toDomain(result) : null;
	}

	async findAll({ createdBy }: { createdBy: string | null }): Promise<Quizz[]> {
		const conditions = [eq(quizzTable.isPublished, true)];
		if (createdBy !== null) {
			conditions.push(eq(quizzTable.createdBy, createdBy));
		}

		const results = await db.query.quizz.findMany({
			where: and(...conditions),
		});
		return results.map(raw => QuizzMapper.toDomain(raw));
	}
}
