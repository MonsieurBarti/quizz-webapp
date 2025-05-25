import { injectable } from 'inversify';
import type { Attempt } from '@quizz-taker/domain/attempt/attempt';
import type { AttemptRepository } from '@quizz-taker/domain/attempt/attempt.repository';

@injectable()
export class InMemoryAttemptRepository implements AttemptRepository {
	private readonly attempts: Attempt[] = [];

	async findByPlayerIdAndQuizzId({ playerId, quizzId }: { playerId: string; quizzId: string }): Promise<Attempt | null> {
		const attempt = this.attempts.find(a => a.playerId === playerId && a.quizzId === quizzId);
		return Promise.resolve(attempt || null);
	}

	async save(attempt: Attempt): Promise<void> {
		const index = this.attempts.findIndex(a => a.id === attempt.id);
		if (index !== -1) {
			this.attempts[index] = attempt;
		} else {
			this.attempts.push(attempt);
		}
		return Promise.resolve();
	}

	public clear(): void {
		this.attempts.length = 0;
	}

	public seed(attempts: Attempt[]): void {
		this.clear();
		attempts.forEach(a => this.attempts.push(a));
	}
}
