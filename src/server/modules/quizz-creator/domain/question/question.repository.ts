import type { Question } from '@quizz-creator/domain/question/question';

/**
 * Interface for the question repository.
 * Defines methods for interacting with question data storage.
 */
export interface QuestionRepository {
	/**
	 * Finds a question by its ID.
	 * @param {object} params - The parameters for finding a question.
	 * @param {string} params.id - The ID of the question to find.
	 * @returns {Promise<Question | null>} A promise that resolves with the question if found, or null otherwise.
	 */
	findById({ id }: { id: string }): Promise<Question | null>;

	/**
	 * Finds all questions associated with a specific quizz ID.
	 * @param {object} params - The parameters for finding questions.
	 * @param {string} params.quizzId - The ID of the quizz whose questions are to be found.
	 * @returns {Promise<Question[]>} A promise that resolves with an array of questions, ordered by their 'order' property.
	 */
	findByQuizzId({ quizzId }: { quizzId: string }): Promise<Question[]>;

	/**
	 * Saves a question.
	 * If the question exists, it should be updated. Otherwise, it should be created.
	 * @param {Question} question - The question to save.
	 * @returns {Promise<void>} A promise that resolves when the save operation is complete.
	 */
	save(question: Question): Promise<void>;

	/**
	 * Deletes a question by its ID.
	 * @param {object} params - The parameters for deleting a question.
	 * @param {string} params.id - The ID of the question to delete.
	 * @returns {Promise<void>} A promise that resolves when the delete operation is complete.
	 */
	deleteById({ id }: { id: string }): Promise<void>;
}
