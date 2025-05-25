import type { Question } from '@quizz-taker/domain/question/question';
import type { QuestionReader } from '@quizz-taker/domain/question/question.reader';
import { injectable } from 'inversify';

@injectable()
export class InMemoryQuestionReader implements QuestionReader {
	private readonly questions: Map<string, Question> = new Map();

	async findById({ id }: { id: string }): Promise<Question | null> {
		const question = this.questions.get(id);
		return question || null;
	}

	async findByQuizzId({ quizzId }: { quizzId: string }): Promise<Question[]> {
		const allQuestions = Array.from(this.questions.values());
		const questionsForQuizz = allQuestions.filter(q => q.quizzId === quizzId);
		return questionsForQuizz.sort((a, b) => a.order - b.order);
	}

	async findNextQuestion({
		quizzId,
		currentQuestionId,
	}: {
		quizzId: string;
		currentQuestionId: string | null;
	}): Promise<Question | null> {
		const allQuestionsForQuizz = Array.from(this.questions.values())
			.filter(q => q.quizzId === quizzId)
			.sort((a, b) => a.order - b.order);

		if (currentQuestionId === null) {
			return allQuestionsForQuizz.length > 0 ? allQuestionsForQuizz[0] ?? null : null;
		}

		const currentIndex = allQuestionsForQuizz.findIndex(q => q.id === currentQuestionId);

		if (currentIndex === -1 || currentIndex === allQuestionsForQuizz.length - 1) {
			return null;
		}

		return allQuestionsForQuizz[currentIndex + 1] ?? null;
	}

	public clear(): void {
		this.questions.clear();
	}

	public seed(questionsToSeed: Question[]): void {
		this.clear();
		questionsToSeed.forEach(q => this.questions.set(q.id, q));
	}
}
