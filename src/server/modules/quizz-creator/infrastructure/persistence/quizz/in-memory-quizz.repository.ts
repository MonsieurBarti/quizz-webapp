import { injectable } from 'inversify';
import type { Quizz } from '@quizz-creator/domain/quizz/quizz';
import type { QuizzRepository } from '@quizz-creator/domain/quizz/quizz.repository';

@injectable()
export class InMemoryQuizzRepository implements QuizzRepository {
	private readonly quizzes: Map<string, Quizz> = new Map();

	async findById({ id }: { id: string }): Promise<Quizz | null> {
		const quizz = this.quizzes.get(id);
		return Promise.resolve(quizz || null);
	}

	async findByCreatorId({ creatorId }: { creatorId: string }): Promise<Quizz[]> {
		const userQuizzes = Array.from(this.quizzes.values()).filter(q => q.createdBy === creatorId);
		return Promise.resolve(userQuizzes);
	}

	async save(quizz: Quizz): Promise<void> {
		this.quizzes.set(quizz.id, quizz);
		return Promise.resolve();
	}

	async deleteById({ id }: { id: string }): Promise<void> {
		this.quizzes.delete(id);
		return Promise.resolve();
	}

	public clear(): void {
		this.quizzes.clear();
	}

	public seed(quizzesToSeed: Quizz[]): void {
		this.clear();
		quizzesToSeed.forEach(q => this.quizzes.set(q.id, q));
	}
}
