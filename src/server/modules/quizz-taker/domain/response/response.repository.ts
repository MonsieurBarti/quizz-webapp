import type { Response } from '@quizz-taker/domain/response/response';

/**
 * Interface for the response repository.
 */
export interface ResponseRepository {
	/**
	 * Retrieves a response by its question ID and attempt ID.
	 * This is useful for checking if a player has already answered a specific question in a given attempt.
	 * @param {object} params - The parameters for finding a response.
	 * @param {string} params.questionId - The ID of the question.
	 * @param {string} params.attemptId - The ID of the attempt.
	 * @returns {Promise<Response | null>} A promise that resolves with the response if found, or null otherwise.
	 */
	getByQuestionIdAndAttemptId({
		questionId,
		attemptId,
	}: {
		questionId: string;
		attemptId: string;
	}): Promise<Response | null>;

	/**
	 * Saves a response.
	 * If the response already exists (e.g., based on its ID or a composite key like attemptId and questionId),
	 * it should be updated. Otherwise, it should be created.
	 * @param {Response} response - The response to save.
	 * @returns {Promise<void>} A promise that resolves when the save operation is complete.
	 */
	save(response: Response): Promise<void>;
}
