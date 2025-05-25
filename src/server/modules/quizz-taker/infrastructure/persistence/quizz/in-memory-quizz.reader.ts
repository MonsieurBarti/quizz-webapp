import { injectable } from 'inversify';
import type { Quizz } from '@quizz-taker/domain/quizz/quizz';
import type { QuizzReader } from '@quizz-taker/domain/quizz/quizz.reader';

@injectable()
export class InMemoryQuizzReader implements QuizzReader {
	private readonly quizzes: Map<string, Quizz> = new Map();

	async findById({ id }: { id: string }): Promise<Quizz | null> {
		const quizz = this.quizzes.get(id);
		return Promise.resolve(quizz || null);
	}

	async findAll({ createdBy }: { createdBy: string | null }): Promise<Quizz[]> {
		const allQuizzes = Array.from(this.quizzes.values());
		if (createdBy === null) { 
			return Promise.resolve(allQuizzes);
		}
		const filteredQuizzes = allQuizzes.filter(q => q.createdBy === createdBy);
		return Promise.resolve(filteredQuizzes);
	}

	public clear(): void {
		this.quizzes.clear();
	}

	public seed(quizzesToSeed: Quizz[]): void {
		this.clear();
		quizzesToSeed.forEach(q => this.quizzes.set(q.id, q));
	}
}
