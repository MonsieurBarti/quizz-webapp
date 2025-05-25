import type { Answer } from '@quizz-creator/domain/answer/answer';

/**
 * Interface for the answer repository.
 * Defines methods for interacting with answer data storage.
 */
export interface AnswerRepository {
	/**
	 * Finds an answer by its ID.
	 * @param {object} params - The parameters for finding an answer.
	 * @param {string} params.id - The ID of the answer to find.
	 * @returns {Promise<Answer | null>} A promise that resolves with the answer if found, or null otherwise.
	 */
	findById({ id }: { id: string }): Promise<Answer | null>;

	/**
	 * Finds all answers associated with a specific question ID.
	 * @param {object} params - The parameters for finding answers.
	 * @param {string} params.questionId - The ID of the question whose answers are to be found.
	 * @returns {Promise<Answer[]>} A promise that resolves with an array of answers.
	 */
	findByQuestionId({ questionId }: { questionId: string }): Promise<Answer[]>;

	/**
	 * Saves a single answer.
	 * If the answer exists, it should be updated. Otherwise, it should be created.
	 * @param {Answer} answer - The answer to save.
	 * @returns {Promise<void>} A promise that resolves when the save operation is complete.
	 */
	save(answer: Answer): Promise<void>;

	/**
	 * Saves multiple answers.
	 * This is typically used for bulk creation or updates.
	 * @param {Answer[]} answers - An array of answers to save.
	 * @returns {Promise<void>} A promise that resolves when all save operations are complete.
	 */
	saveMany(answers: Answer[]): Promise<void>;

	/**
	 * Deletes an answer by its ID.
	 * @param {object} params - The parameters for deleting an answer.
	 * @param {string} params.id - The ID of the answer to delete.
	 * @returns {Promise<void>} A promise that resolves when the delete operation is complete.
	 */
	deleteById({ id }: { id: string }): Promise<void>;
}
