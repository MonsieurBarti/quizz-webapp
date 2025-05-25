import { injectable } from 'inversify';
import { eq } from 'drizzle-orm';
import type { Quizz } from '@quizz-creator/domain/quizz/quizz';
import type { QuizzRepository } from '@quizz-creator/domain/quizz/quizz.repository';
import { QuizzMapper } from './quizz.mapper';
import { quizz } from '@/server/db/schema';
import { db } from '@/server/db';

@injectable()
export class SqlQuizzRepository implements QuizzRepository {
	async findById({ id }: { id: string }): Promise<Quizz | null> {
		const result = await db.query.quizz.findFirst({ where: eq(quizz.id, id) });
		return result ? QuizzMapper.toDomain(result) : null;
	}

	async findByCreatorId({ creatorId }: { creatorId: string }): Promise<Quizz[]> {
		const results = await db.query.quizz.findMany({ where: eq(quizz.createdBy, creatorId) });
		return results.map(QuizzMapper.toDomain);
	}

	async save(domainQuizz: Quizz): Promise<void> {
		const quizzRecord = QuizzMapper.toPersistence(domainQuizz);

		await db
			.insert(quizz)
			.values(quizzRecord)
			.onConflictDoUpdate({
				target: quizz.id,
				set: {
					title: quizzRecord.title,
					description: quizzRecord.description,
					isPublished: quizzRecord.isPublished,
				},
			});
	}

	async deleteById({ id }: { id: string }): Promise<void> {
		await db.delete(quizz).where(eq(quizz.id, id));
	}
}
