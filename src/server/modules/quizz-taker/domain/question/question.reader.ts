import type { Question } from './question';

/**
 * Interface for the question reader.
 * Defines methods for reading question data, typically used in query operations.
 */
export interface QuestionReader {
	/**
	 * Finds a question by its ID.
	 * @param {object} params - The parameters for finding a question.
	 * @param {string} params.id - The ID of the question to find.
	 * @returns {Promise<Question | null>} A promise that resolves with the question if found, or null otherwise.
	 */
	findById({ id }: { id: string }): Promise<Question | null>;

	/**
	 * Finds all questions associated with a specific quizz ID.
	 * This is used to retrieve all questions belonging to a particular quizz.
	 * @param {object} params - The parameters for finding questions.
	 * @param {string} params.quizzId - The ID of the quizz whose questions are to be retrieved.
	 * @returns {Promise<Question[]>} A promise that resolves with an array of questions, typically ordered by their 'order' property.
	 */
	findByQuizzId({ quizzId }: { quizzId: string }): Promise<Question[]>;

	/**
	 * Finds the next question in a quizz, ordered by the 'order' property.
	 * If currentQuestionId is null, it fetches the first question of the quizz.
	 * If currentQuestionId is provided, it fetches the question immediately following it.
	 * @param {object} params - The parameters for finding the next question.
	 * @param {string} params.quizzId - The ID of the quizz.
	 * @param {string | null} params.currentQuestionId - The ID of the current question, or null to get the first question.
	 * @returns {Promise<Question | null>} A promise that resolves with the next question if one exists, or null otherwise.
	 */
	findNextQuestion({
		quizzId,
		currentQuestionId,
	}: {
		quizzId: string;
		currentQuestionId: string | null;
	}): Promise<Question | null>;
}
