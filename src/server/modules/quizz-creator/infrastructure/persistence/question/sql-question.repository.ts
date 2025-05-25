import { injectable } from 'inversify';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { question } from '@/server/db/schema';
import { Question } from '@quizz-creator/domain/question/question';
import type { QuestionRepository } from '@quizz-creator/domain/question/question.repository';
import { QuestionMapper } from './question.mapper';

@injectable()
export class SqlQuestionRepository implements QuestionRepository {
	async findById({ id }: { id: string }): Promise<Question | null> {
		const result = await db.query.question.findFirst({
			where: eq(question.id, id),
		});
		return result ? QuestionMapper.toDomain(result) : null;
	}

	async findByQuizzId({ quizzId }: { quizzId: string }): Promise<Question[]> {
		const results = await db.query.question.findMany({
			where: eq(question.quizId, quizzId),
			orderBy: (questions, { asc }) => [asc(questions.order)],
		});

		return results.map(QuestionMapper.toDomain);
	}

	async save(domainQuestion: Question): Promise<void> {
		const questionPersistence = QuestionMapper.toPersistence(domainQuestion);

		await db
			.insert(question)
			.values(questionPersistence)
			.onConflictDoUpdate({
				target: question.id,
				set: {
					quizId: questionPersistence.quizId,
					text: questionPersistence.text,
					order: questionPersistence.order,
					imageUrl: questionPersistence.imageUrl,
				},
			});
	}

	async deleteById({ id }: { id: string }): Promise<void> {
		await db.delete(question).where(eq(question.id, id));
	}
}
