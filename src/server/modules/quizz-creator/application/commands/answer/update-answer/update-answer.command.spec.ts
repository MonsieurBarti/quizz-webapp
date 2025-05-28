import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateAnswerCommand, UpdateAnswerCommandHandler, UpdateAnswerCommandProps } from './update-answer.command';
import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryAnswerRepository } from '@quizz-creator/infrastructure/persistence/answer/in-memory-answer.repository';
import { InMemoryQuestionRepository } from '@quizz-creator/infrastructure/persistence/question/in-memory-question.repository';
import { InMemoryQuizzRepository } from '@quizz-creator/infrastructure/persistence/quizz/in-memory-quizz.repository';
import { AnswerBuilder } from '@quizz-creator/domain/answer/answer.builder';
import { QuestionBuilder } from '@quizz-creator/domain/question/question.builder';
import { QuizzBuilder } from '@quizz-creator/domain/quizz/quizz.builder';
import { AnswerNotFound, UnauthorizedAnswerAccess } from '@quizz-creator/domain/errors/quizz-creator.errors';
import { Answer } from '@quizz-creator/domain/answer/answer';
import { Question } from '@quizz-creator/domain/question/question';

describe('UpdateAnswerCommandHandler', () => {
	let answerRepository: InMemoryAnswerRepository;
	let questionRepository: InMemoryQuestionRepository;
	let quizzRepository: InMemoryQuizzRepository;
	let handler: UpdateAnswerCommandHandler;
	let questionBuilder: QuestionBuilder;
	let quizzBuilder: QuizzBuilder;
	let answerBuilder: AnswerBuilder;
	let existingQuestion: Question;
	const userId = '11111111-1111-1111-1111-111111111111';
	const differentUserId = '22222222-2222-2222-2222-222222222222';

	beforeEach(async () => {
		answerRepository = new InMemoryAnswerRepository();
		questionRepository = new InMemoryQuestionRepository();
		quizzRepository = new InMemoryQuizzRepository();
		handler = new UpdateAnswerCommandHandler(answerRepository, questionRepository, quizzRepository);
		questionBuilder = new QuestionBuilder();
		quizzBuilder = new QuizzBuilder();
		answerBuilder = new AnswerBuilder();

		// Create a common quizz and question for tests
		const existingQuizz = quizzBuilder.withCreatedBy(userId).build();
		await quizzRepository.save(existingQuizz);

		existingQuestion = questionBuilder.withQuizzId(existingQuizz.id).build();
		await questionRepository.save(existingQuestion);
	});

	it('should update an existing answer successfully', async () => {
		// Arrange
		const initialAnswer = answerBuilder
			.withQuestionId(existingQuestion.id!)
			.withText('Old text')
			.withIsCorrect(false)
			.withOrder(1)
			.withNextQuestionId(null)
			.build();
		await answerRepository.save(initialAnswer);

		const updateProps: UpdateAnswerCommandProps = {
			id: initialAnswer.id!,
			text: 'New updated text',
			isCorrect: true,
			order: 2,
			nextQuestionId: questionBuilder.build().id, // Mock a new next question ID
			context: { userId }
		};
		const command = new UpdateAnswerCommand(updateProps);

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(result).toBeInstanceOf(Answer);
		expect(result.id).toBe(initialAnswer.id);
		expect(result.text).toBe(updateProps.text);
		expect(result.isCorrect).toBe(updateProps.isCorrect);
		expect(result.order).toBe(updateProps.order);
		expect(result.nextQuestionId).toBe(updateProps.nextQuestionId);

		const savedAnswer = await answerRepository.findById({ id: initialAnswer.id! });
		expect(savedAnswer?.text).toBe(updateProps.text);
		expect(savedAnswer?.isCorrect).toBe(updateProps.isCorrect);
	});

	it('should throw AnswerNotFound if the answer to update does not exist', async () => {
		// Arrange
		const nonExistentAnswerId = '00000000-0000-0000-0000-000000000000';
		const commandProps: UpdateAnswerCommandProps = {
			id: nonExistentAnswerId,
			text: 'Text for a ghost answer',
			context: { userId }
		};
		const command = new UpdateAnswerCommand(commandProps);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(AnswerNotFound);
		await expect(handler.execute(command)).rejects.toThrow(`Answer with ID "${nonExistentAnswerId}" not found.`);
	});

	it('should partially update an answer if only some fields are provided', async () => {
		// Arrange
		const initialAnswer = answerBuilder
			.withQuestionId(existingQuestion.id!)
			.withText('Initial Text')
			.withIsCorrect(false)
			.withOrder(0)
			.build();
		await answerRepository.save(initialAnswer);

		const partialUpdateProps: UpdateAnswerCommandProps = {
			id: initialAnswer.id!,
			text: 'Partially Updated Text',
			// isCorrect and order are not provided
			context: { userId }
		};
		const command = new UpdateAnswerCommand(partialUpdateProps);

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(result.text).toBe(partialUpdateProps.text);
		expect(result.isCorrect).toBe(initialAnswer.isCorrect); // Should remain unchanged
		expect(result.order).toBe(initialAnswer.order); // Should remain unchanged

		const savedAnswer = await answerRepository.findById({ id: initialAnswer.id! });
		expect(savedAnswer?.text).toBe(partialUpdateProps.text);
		expect(savedAnswer?.isCorrect).toBe(initialAnswer.isCorrect);
	});

	it('should correctly update nextQuestionId to null', async () => {
		// Arrange
		const nextQ = questionBuilder.build();
		await questionRepository.save(nextQ);

		const initialAnswer = answerBuilder.withQuestionId(existingQuestion.id!).withNextQuestionId(nextQ.id).build();
		await answerRepository.save(initialAnswer);

		const updateProps: UpdateAnswerCommandProps = {
			id: initialAnswer.id!,
			nextQuestionId: null,
			context: { userId }
		};
		const command = new UpdateAnswerCommand(updateProps);

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(result.nextQuestionId).toBeNull();
		const savedAnswer = await answerRepository.findById({ id: initialAnswer.id! });
		expect(savedAnswer?.nextQuestionId).toBeNull();
	});

	it('should throw UnauthorizedAnswerAccess if user is not the owner of the parent quizz', async () => {
		// Arrange
		const existingQuizz = quizzBuilder.withCreatedBy(userId).build();
		await quizzRepository.save(existingQuizz);

		const question = questionBuilder
			.withQuizzId(existingQuizz.id)
			.build();
		await questionRepository.save(question);

		const answer = answerBuilder
			.withQuestionId(question.id!)
			.build();
		await answerRepository.save(answer);

		const updateProps: UpdateAnswerCommandProps = {
			id: answer.id!,
			text: 'Unauthorized update attempt',
			context: { userId: differentUserId } // Different user trying to update
		};
		const command = new UpdateAnswerCommand(updateProps);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(UnauthorizedAnswerAccess);
	});
});
