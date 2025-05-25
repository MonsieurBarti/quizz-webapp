import { injectable } from 'inversify';
import type { Question } from '@quizz-creator/domain/question/question';
import type { QuestionRepository } from '@quizz-creator/domain/question/question.repository';

@injectable()
export class InMemoryQuestionRepository implements QuestionRepository {
	private readonly questions: Map<string, Question> = new Map();

	async findById({ id }: { id: string }): Promise<Question | null> {
		const question = this.questions.get(id);
		return Promise.resolve(question || null);
	}

	async findByQuizzId({ quizzId }: { quizzId: string }): Promise<Question[]> {
		const quizzQuestions = Array.from(this.questions.values()).filter(q => q.quizzId === quizzId);
		return Promise.resolve(quizzQuestions.sort((a, b) => a.order - b.order));
	}

	async save(question: Question): Promise<void> {
		this.questions.set(question.id, question);
		return Promise.resolve();
	}

	async deleteById({ id }: { id: string }): Promise<void> {
		this.questions.delete(id);
		return Promise.resolve();
	}

	public clear(): void {
		this.questions.clear();
	}

	public getQuestions(): Question[] {
		return Array.from(this.questions.values());
	}
}
