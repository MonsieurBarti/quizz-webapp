import type { Answer } from './answer';

/**
 * Interface for the answer reader.
 * Defines methods for reading answer data, typically used in query operations.
 */
export interface AnswerReader {
	/**
	 * Finds all answers associated with a specific question ID.
	 * This is used to retrieve all possible answers for a given question.
	 * @param {object} params - The parameters for finding answers.
	 * @param {string} params.questionId - The ID of the question whose answers are to be retrieved.
	 * @returns {Promise<Answer[]>} A promise that resolves with an array of answers, typically ordered by their 'order' property.
	 */
	findByQuestionId({ questionId }: { questionId: string }): Promise<Answer[]>;
}
