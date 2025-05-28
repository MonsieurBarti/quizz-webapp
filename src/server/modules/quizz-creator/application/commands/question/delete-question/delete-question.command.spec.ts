import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	DeleteQuestionCommand,
	DeleteQuestionCommandHandler,
	DeleteQuestionCommandProps,
} from './delete-question.command';
import { InMemoryQuestionRepository } from '@quizz-creator/infrastructure/persistence/question/in-memory-question.repository';
import { InMemoryQuizzRepository } from '@quizz-creator/infrastructure/persistence/quizz/in-memory-quizz.repository';
import { QuestionBuilder } from '@quizz-creator/domain/question/question.builder';
import { QuizzBuilder } from '@quizz-creator/domain/quizz/quizz.builder';
import { QuestionNotFound, UnauthorizedQuestionAccess } from '@quizz-creator/domain/errors/quizz-creator.errors';
import type { Question } from '@quizz-creator/domain/question/question';
import type { Quizz } from '@quizz-creator/domain/quizz/quizz';

describe('DeleteQuestionCommandHandler', () => {
	let questionRepository: InMemoryQuestionRepository;
	let quizzRepository: InMemoryQuizzRepository;
	let handler: DeleteQuestionCommandHandler;
	const userId = '11111111-1111-1111-1111-111111111111';
	const differentUserId = '22222222-2222-2222-2222-222222222222';

	beforeEach(() => {
		questionRepository = new InMemoryQuestionRepository();
		quizzRepository = new InMemoryQuizzRepository();
		handler = new DeleteQuestionCommandHandler(questionRepository, quizzRepository);

		vi.spyOn(questionRepository, 'findById');
		vi.spyOn(questionRepository, 'deleteById');
		vi.spyOn(quizzRepository, 'findById');
	});

	async function createQuizz(creatorId: string = userId): Promise<Quizz> {
		const quizz = new QuizzBuilder().withCreatedBy(creatorId).build();
		await quizzRepository.save(quizz);
		return quizz;
	}

	async function createQuestion(quizzId: string, text: string = 'Test Question'): Promise<Question> {
		const question = new QuestionBuilder().withQuizzId(quizzId).withText(text).build();
		await questionRepository.save(question);
		vi.clearAllMocks(); // Reset call counts after setup
		return question;
	}

	function createDeleteCommand(questionId: string, contextUserId: string = userId): DeleteQuestionCommand {
		const props: DeleteQuestionCommandProps = {
			id: questionId,
			context: { userId: contextUserId },
		};
		return new DeleteQuestionCommand(props);
	}

	it('should delete an existing question successfully', async () => {
		// Arrange
		const parentQuizz = await createQuizz();
		const questionToDelete = await createQuestion(parentQuizz.id!);
		expect(await questionRepository.findById({ id: questionToDelete.id! })).toBeDefined(); // Ensure it's there

		const command = createDeleteCommand(questionToDelete.id!);

		// Act
		await handler.execute(command);

		// Assert
		expect(questionRepository.findById).toHaveBeenCalledWith({ id: questionToDelete.id! });
		expect(quizzRepository.findById).toHaveBeenCalledWith({ id: parentQuizz.id! });
		expect(questionRepository.deleteById).toHaveBeenCalledWith({ id: questionToDelete.id! });

		const deletedQuestion = await questionRepository.findById({ id: questionToDelete.id! });
		expect(deletedQuestion).toBeNull();
	});

	it('should throw QuestionNotFound if the question to delete does not exist', async () => {
		// Arrange
		const nonExistentQuestionId = '00000000-0000-0000-0000-000000000000';
		const command = createDeleteCommand(nonExistentQuestionId);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(QuestionNotFound);
		await expect(handler.execute(command)).rejects.toThrow(
			`Question with ID "${nonExistentQuestionId}" not found.`,
		);
		expect(questionRepository.deleteById).not.toHaveBeenCalled();
	});

	it('should throw UnauthorizedQuestionAccess if user is not the owner of the parent quizz', async () => {
		// Arrange
		const parentQuizz = await createQuizz(userId); // Owned by userId
		const question = await createQuestion(parentQuizz.id!, 'Question to delete');
		const command = createDeleteCommand(question.id!, differentUserId); // Different user trying to delete

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(UnauthorizedQuestionAccess);
		expect(questionRepository.deleteById).not.toHaveBeenCalled();
	});
});
