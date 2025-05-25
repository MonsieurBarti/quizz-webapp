import { injectable } from 'inversify';
import type { Answer } from '@quizz-taker/domain/answer/answer';
import type { AnswerReader } from '@quizz-taker/domain/answer/answer.reader';

@injectable()
export class InMemoryAnswerReader implements AnswerReader {
	private readonly answers: Map<string, Answer> = new Map();

	async findByQuestionId({ questionId }: { questionId: string }): Promise<Answer[]> {
		const questionAnswers = Array.from(this.answers.values()).filter(
			answer => answer.questionId === questionId,
		);
		return Promise.resolve(questionAnswers.sort((a, b) => a.order - b.order));
	}

	public clear(): void {
		this.answers.clear();
	}

	public seed(answersToSeed: Answer[]): void {
		this.clear();
		answersToSeed.forEach(a => this.answers.set(a.id, a));
	}
}
