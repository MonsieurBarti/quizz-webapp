import { injectable } from 'inversify';
import { eq, and } from 'drizzle-orm';
import { db } from '@/server/db';
import { attempt } from '@/server/db/schema';
import { Attempt } from '@/server/modules/quizz-taker/domain/attempt/attempt';
import type { AttemptRepository } from '@/server/modules/quizz-taker/domain/attempt/attempt.repository';
import { AttemptMapper } from './attempt.mapper';

@injectable()
export class SqlAttemptRepository implements AttemptRepository {
	async findByPlayerIdAndQuizzId({
		playerId,
		quizzId,
	}: {
		playerId: string;
		quizzId: string;
	}): Promise<Attempt | null> {
		const result = await db.query.attempt.findFirst({
			where: and(eq(attempt.playerId, playerId), eq(attempt.quizzId, quizzId)),
		});
		return result ? AttemptMapper.toDomain(result) : null;
	}

	async save(domainAttempt: Attempt): Promise<void> {
		await db
			.insert(attempt)
			.values(AttemptMapper.toPersistence(domainAttempt))
			.onConflictDoUpdate({
				target: attempt.id,
				set: {
					quizzId: domainAttempt.quizzId,
					playerId: domainAttempt.playerId,
					completedAt: domainAttempt.completedAt,
					startedAt: domainAttempt.startedAt,
					score: domainAttempt.score,
					totalQuestionsAnswered: domainAttempt.totalQuestionsAnswered,
				},
			});
	}
}
