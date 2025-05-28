import type { AnswerReader } from '@quizz-taker/domain/answer/answer.reader';
import type { Answer } from '@quizz-taker/domain/answer/answer';

export class InMemoryAnswerReader implements AnswerReader {
    private answers: Map<string, Answer> = new Map();

    /**
     * Adds an answer to the in-memory storage
     * @param answer The answer to add
     */
    public addAnswer(answer: Answer): void {
        this.answers.set(answer.id, answer);
    }

    /**
     * Clears all answers from the in-memory storage
     */
    public clear(): void {
        this.answers.clear();
    }

    /**
     * Finds an answer by its ID
     * @param id The ID of the answer to find
     * @returns The answer if found, null otherwise
     */
    public async findById(id: string): Promise<Answer | null> {
        return this.answers.get(id) || null;
    }
}
