import { injectable } from 'inversify';
import { eq, and } from 'drizzle-orm';
import { db } from '@/server/db';
import { response } from '@/server/db/schema';
import { Response } from '@/server/modules/quizz-taker/domain/response/response';
import type { ResponseRepository } from '@/server/modules/quizz-taker/domain/response/response.repository';
import { ResponseMapper } from './response.mapper';

@injectable()
export class SqlResponseRepository implements ResponseRepository {
	async getByQuestionIdAndAttemptId({
		questionId,
		attemptId,
	}: {
		questionId: string;
		attemptId: string;
	}): Promise<Response | null> {
		const result = await db.query.response.findFirst({
			where: and(eq(response.questionId, questionId), eq(response.attemptId, attemptId)),
		});
		return result ? ResponseMapper.toDomain(result) : null;
	}

	async save(domainResponse: Response): Promise<void> {
		await db
			.insert(response)
			.values(ResponseMapper.toPersistence(domainResponse))
			.onConflictDoUpdate({
				target: response.id,
				set: {
					attemptId: domainResponse.attemptId,
					questionId: domainResponse.questionId,
					answerId: domainResponse.answerId,
					isCorrect: domainResponse.isCorrect,
					timeTakenMs: domainResponse.timeTakenMs,
				},
			});
	}
}
