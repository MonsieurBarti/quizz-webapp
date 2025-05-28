import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteAnswerCommand, DeleteAnswerCommandHandler, DeleteAnswerCommandProps } from './delete-answer.command';
import { InMemoryAnswerRepository } from '@quizz-creator/infrastructure/persistence/answer/in-memory-answer.repository';
import { InMemoryQuestionRepository } from '@quizz-creator/infrastructure/persistence/question/in-memory-question.repository';
import { InMemoryQuizzRepository } from '@quizz-creator/infrastructure/persistence/quizz/in-memory-quizz.repository';
import { AnswerBuilder } from '@quizz-creator/domain/answer/answer.builder';
import { QuestionBuilder } from '@quizz-creator/domain/question/question.builder';
import { QuizzBuilder } from '@quizz-creator/domain/quizz/quizz.builder';
import { AnswerNotFound, UnauthorizedAnswerAccess } from '@quizz-creator/domain/errors/quizz-creator.errors';
import type { Answer } from '@quizz-creator/domain/answer/answer';
import type { Question } from '@quizz-creator/domain/question/question';
import type { Quizz } from '@quizz-creator/domain/quizz/quizz';

describe('DeleteAnswerCommandHandler', () => {
	let answerRepository: InMemoryAnswerRepository;
	let questionRepository: InMemoryQuestionRepository;
	let quizzRepository: InMemoryQuizzRepository;
	let handler: DeleteAnswerCommandHandler;
	const userId = '11111111-1111-1111-1111-111111111111';
	const differentUserId = '22222222-2222-2222-2222-222222222222';

	beforeEach(() => {
		answerRepository = new InMemoryAnswerRepository();
		questionRepository = new InMemoryQuestionRepository();
		quizzRepository = new InMemoryQuizzRepository();
		handler = new DeleteAnswerCommandHandler(answerRepository, questionRepository, quizzRepository);

		vi.spyOn(answerRepository, 'findById');
		vi.spyOn(answerRepository, 'deleteById');
		vi.spyOn(questionRepository, 'findById');
		vi.spyOn(quizzRepository, 'findById');
	});

	async function createQuizz(creatorId: string = userId): Promise<Quizz> {
		const quizz = new QuizzBuilder().withCreatedBy(creatorId).build();
		await quizzRepository.save(quizz);
		return quizz;
	}

	async function createQuestion(quizzId: string): Promise<Question> {
		const question = new QuestionBuilder().withQuizzId(quizzId).build();
		await questionRepository.save(question);
		return question;
	}

	async function createAnswer(questionId: string, text: string = 'Test Answer'): Promise<Answer> {
		const answer = new AnswerBuilder().withQuestionId(questionId).withText(text).build();
		await answerRepository.save(answer);
		vi.clearAllMocks(); // Reset call counts after setup
		return answer;
	}

	function createDeleteCommand(answerId: string, contextUserId: string = userId): DeleteAnswerCommand {
		const props: DeleteAnswerCommandProps = {
			id: answerId,
			context: { userId: contextUserId },
		};
		return new DeleteAnswerCommand(props);
	}

	it('should delete an existing answer successfully', async () => {
		// Arrange
		const quizz = await createQuizz();
		const question = await createQuestion(quizz.id!);
		const answerToDelete = await createAnswer(question.id!);
		expect(await answerRepository.findById({ id: answerToDelete.id! })).toBeDefined(); // Ensure it's there

		const command = createDeleteCommand(answerToDelete.id!);

		// Act
		await handler.execute(command);

		// Assert
		expect(answerRepository.findById).toHaveBeenCalledWith({ id: answerToDelete.id! });
		expect(questionRepository.findById).toHaveBeenCalledWith({ id: question.id! });
		expect(quizzRepository.findById).toHaveBeenCalledWith({ id: quizz.id! });
		expect(answerRepository.deleteById).toHaveBeenCalledWith({ id: answerToDelete.id! });

		const deletedAnswer = await answerRepository.findById({ id: answerToDelete.id! });
		expect(deletedAnswer).toBeNull();
	});

	it('should throw AnswerNotFound if the answer to delete does not exist', async () => {
		// Arrange
		const nonExistentAnswerId = '00000000-0000-0000-0000-000000000000';
		const command = createDeleteCommand(nonExistentAnswerId);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(AnswerNotFound);
		await expect(handler.execute(command)).rejects.toThrow(`Answer with ID "${nonExistentAnswerId}" not found.`);
		expect(answerRepository.deleteById).not.toHaveBeenCalled();
	});

	it('should throw UnauthorizedAnswerAccess if user is not the owner of the parent quizz', async () => {
		// Arrange
		const quizz = await createQuizz(userId); // Owned by userId
		const question = await createQuestion(quizz.id!);
		const answer = await createAnswer(question.id!, 'Answer to delete');
		const command = createDeleteCommand(answer.id!, differentUserId); // Different user trying to delete

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(UnauthorizedAnswerAccess);
		expect(answerRepository.deleteById).not.toHaveBeenCalled();
	});
});
