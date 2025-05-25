import { injectable } from 'inversify';
import type { Answer } from '@quizz-creator/domain/answer/answer';
import type { AnswerRepository } from '@quizz-creator/domain/answer/answer.repository';

@injectable()
export class InMemoryAnswerRepository implements AnswerRepository {
	private readonly answers: Map<string, Answer> = new Map();

	async findById({ id }: { id: string }): Promise<Answer | null> {
		const answer = this.answers.get(id);
		return Promise.resolve(answer || null);
	}

	async findByQuestionId({ questionId }: { questionId: string }): Promise<Answer[]> {
		const questionAnswers = Array.from(this.answers.values()).filter(a => a.questionId === questionId);
		return Promise.resolve(questionAnswers.sort((a, b) => a.order - b.order));
	}

	async save(answer: Answer): Promise<void> {
		this.answers.set(answer.id, answer);
		return Promise.resolve();
	}

	async saveMany(answersToSave: Answer[]): Promise<void> {
		answersToSave.forEach(answer => {
			this.answers.set(answer.id, answer);
		});
		return Promise.resolve();
	}

	async deleteById({ id }: { id: string }): Promise<void> {
		this.answers.delete(id);
		return Promise.resolve();
	}

	async deleteByQuestionId({ questionId }: { questionId: string }): Promise<void> {
		for (const [id, answer] of this.answers.entries()) {
			if (answer.questionId === questionId) {
				this.answers.delete(id);
			}
		}
		return Promise.resolve();
	}
}
