import { injectable } from 'inversify';
import { Response } from '@quizz-taker/domain/response/response';
import type { ResponseRepository } from '@quizz-taker/domain/response/response.repository';

@injectable()
export class InMemoryResponseRepository implements ResponseRepository {
	private readonly responses: Response[] = [];

	async getByQuestionIdAndAttemptId({
		questionId,
		attemptId,
	}: {
		questionId: string;
		attemptId: string;
	}): Promise<Response | null> {
		const response = this.responses.find(r => r.questionId === questionId && r.attemptId === attemptId);
		return response || null;
	}

	async save(response: Response): Promise<void> {
		const index = this.responses.findIndex(r => r.id === response.id);
		if (index !== -1) {
			this.responses[index] = response;
		} else {
			this.responses.push(response);
		}
	}

	public clear(): void {
		this.responses.length = 0;
	}

	public seed(responses: Response[]): void {
		this.clear();
		responses.forEach(r => this.responses.push(r));
	}
}
