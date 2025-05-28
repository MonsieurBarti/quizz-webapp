import type { Answer } from './answer';

export interface AnswerReader {
	findById(id: string): Promise<Answer | null>;
}
