import type { Quizz } from './quizz';

/**
 * Interface for the quizz reader.
 * Defines methods for reading quizz data, typically used in query operations by a quizz taker.
 */
export interface QuizzReader {
	/**
	 * Finds a quizz by its ID.
	 * This is used to retrieve a specific quizz, for example, when a user selects a quizz to take.
	 * @param {object} params - The parameters for finding a quizz.
	 * @param {string} params.id - The ID of the quizz to find.
	 * @returns {Promise<Quizz | null>} A promise that resolves with the quizz if found, or null otherwise.
	 */
	findById({ id }: { id: string }): Promise<Quizz | null>;

	/**
	 * Finds all quizzes, optionally filtered by the creator's ID.
	 * In the context of a quizz taker, this might be used to list all available quizzes or quizzes from a specific creator if applicable.
	 * If `createdBy` is null, it might imply fetching all publicly available or relevant quizzes.
	 * @param {object} params - The parameters for finding quizzes.
	 * @param {string | null} params.createdBy - The ID of the user who created the quizzes. Can be null to fetch quizzes not specific to a creator.
	 * @returns {Promise<Quizz[]>} A promise that resolves with a list of quizzes.
	 */
	findAll({ createdBy }: { createdBy: string | null }): Promise<Quizz[]>;
}
