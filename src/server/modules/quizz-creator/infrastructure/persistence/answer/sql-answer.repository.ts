import { injectable } from 'inversify';
import { eq, inArray } from 'drizzle-orm';
import { db } from '@/server/db';
import { answer } from '@/server/db/schema';
import type { Answer } from '@quizz-creator/domain/answer/answer';
import type { AnswerRepository } from '@quizz-creator/domain/answer/answer.repository';
import { AnswerMapper } from './answer.mapper';

@injectable()
export class SqlAnswerRepository implements AnswerRepository {
	async findById({ id }: { id: string }): Promise<Answer | null> {
		const result = await db.query.answer.findFirst({
			where: eq(answer.id, id),
		});
		return result ? AnswerMapper.toDomain(result) : null;
	}

	async findByQuestionId({ questionId }: { questionId: string }): Promise<Answer[]> {
		const results = await db.query.answer.findMany({
			where: eq(answer.questionId, questionId),
			orderBy: (answers, { asc }) => [asc(answers.order)],
		});
		return results.map(AnswerMapper.toDomain);
	}

	async save(domainAnswer: Answer): Promise<void> {
		const answerPersistence = AnswerMapper.toPersistence(domainAnswer);

		await db
			.insert(answer)
			.values(answerPersistence)
			.onConflictDoUpdate({
				target: answer.id,
				set: {
					questionId: answerPersistence.questionId,
					text: answerPersistence.text,
					isCorrect: answerPersistence.isCorrect,
					order: answerPersistence.order,
					nextQuestionId: answerPersistence.nextQuestionId,
				},
			});
	}

	async saveMany(domainAnswers: Answer[]): Promise<void> {
		if (domainAnswers.length === 0) {
			return Promise.resolve();
		}
		const answersPersistence = domainAnswers.map(AnswerMapper.toPersistence);
		for (const answerPersistence of answersPersistence) {
			await db
				.insert(answer)
				.values(answerPersistence)
				.onConflictDoUpdate({
					target: answer.id,
					set: {
						questionId: answerPersistence.questionId,
						text: answerPersistence.text,
						isCorrect: answerPersistence.isCorrect,
						order: answerPersistence.order,
						nextQuestionId: answerPersistence.nextQuestionId,
					},
				});
		}
	}

	async deleteById({ id }: { id: string }): Promise<void> {
		await db.delete(answer).where(eq(answer.id, id));
	}
}
