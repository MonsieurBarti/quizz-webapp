import 'reflect-metadata';
import {
	UpdateQuestionCommand,
	UpdateQuestionCommandHandler,
	UpdateQuestionCommandProps,
} from './update-question.command';
import { InMemoryQuestionRepository } from '@quizz-creator/infrastructure/persistence/question/in-memory-question.repository';
import { InMemoryQuizzRepository } from '@quizz-creator/infrastructure/persistence/quizz/in-memory-quizz.repository';
import { QuestionBuilder } from '@quizz-creator/domain/question/question.builder';
import { QuizzBuilder } from '@quizz-creator/domain/quizz/quizz.builder';
import { QuestionNotFound, UnauthorizedQuestionAccess } from '@quizz-creator/domain/errors/quizz-creator.errors';
import { Question } from '@quizz-creator/domain/question/question';

describe('UpdateQuestionCommandHandler', () => {
	let questionRepository: InMemoryQuestionRepository;
	let quizzRepository: InMemoryQuizzRepository;
	let handler: UpdateQuestionCommandHandler;
	let questionBuilder: QuestionBuilder;
	let quizzBuilder: QuizzBuilder;
	let existingQuestion: Question;
	const userId = '11111111-1111-1111-1111-111111111111';
	const differentUserId = '22222222-2222-2222-2222-222222222222';

	beforeEach(async () => {
		questionRepository = new InMemoryQuestionRepository();
		quizzRepository = new InMemoryQuizzRepository();
		handler = new UpdateQuestionCommandHandler(questionRepository, quizzRepository);
		questionBuilder = new QuestionBuilder();
		quizzBuilder = new QuizzBuilder();

		const parentQuizz = quizzBuilder.withCreatedBy(userId).build();
		await quizzRepository.save(parentQuizz);

		existingQuestion = questionBuilder.withQuizzId(parentQuizz.id).build();
		await questionRepository.save(existingQuestion);
	});

	it('should update an existing question successfully', async () => {
		// Arrange
		const parentQuizz = quizzBuilder.withCreatedBy(userId).build();
		await quizzRepository.save(parentQuizz);

		const initialQuestion = questionBuilder
			.withText('Old text')
			.withOrder(1)
			.withImageUrl(null)
			.withQuizzId(parentQuizz.id)
			.build();
		await questionRepository.save(initialQuestion);

		const updateProps: UpdateQuestionCommandProps = {
			id: initialQuestion.id!,
			text: 'New updated text',
			order: 2,
			imageUrl: 'https://example.com/new-image.jpg',
			context: { userId }
		};
		const command = new UpdateQuestionCommand(updateProps);

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(result).toBeInstanceOf(Question);
		expect(result.id).toBe(initialQuestion.id);
		expect(result.text).toBe(updateProps.text);
		expect(result.order).toBe(updateProps.order);
		expect(result.imageUrl).toBe(updateProps.imageUrl);

		const savedQuestion = await questionRepository.findById({ id: initialQuestion.id! });
		expect(savedQuestion?.text).toBe(updateProps.text);
		expect(savedQuestion?.order).toBe(updateProps.order);
		expect(savedQuestion?.imageUrl).toBe(updateProps.imageUrl);
	});

	it('should throw QuestionNotFound if the question to update does not exist', async () => {
		// Arrange
		const nonExistentQuestionId = '00000000-0000-0000-0000-000000000000';
		const commandProps: UpdateQuestionCommandProps = {
			id: nonExistentQuestionId,
			text: 'Text for a ghost question',
			context: { userId }
		};
		const command = new UpdateQuestionCommand(commandProps);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(QuestionNotFound);
		await expect(handler.execute(command)).rejects.toThrow(
			`Question with ID "${nonExistentQuestionId}" not found.`,
		);
	});

	it('should partially update an question if only some fields are provided', async () => {
		// Arrange
		const parentQuizz = quizzBuilder.withCreatedBy(userId).build();
		await quizzRepository.save(parentQuizz);

		const initialQuestion = questionBuilder
			.withText('Initial Text')
			.withOrder(0)
			.withImageUrl(null)
			.withQuizzId(parentQuizz.id)
			.build();
		await questionRepository.save(initialQuestion);

		const partialUpdateProps: UpdateQuestionCommandProps = {
			id: initialQuestion.id!,
			text: 'Partially Updated Text',
			// order and imageUrl are not provided
			context: { userId }
		};
		const command = new UpdateQuestionCommand(partialUpdateProps);

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(result.text).toBe(partialUpdateProps.text);
		expect(result.order).toBe(initialQuestion.order); // Should remain unchanged
		expect(result.imageUrl).toBe(initialQuestion.imageUrl); // Should remain unchanged

		const savedQuestion = await questionRepository.findById({ id: initialQuestion.id! });
		expect(savedQuestion?.text).toBe(partialUpdateProps.text);
		expect(savedQuestion?.order).toBe(initialQuestion.order);
	});

	it('should throw UnauthorizedQuestionAccess if user is not the owner of the parent quizz', async () => {
		// Arrange
		const parentQuizz = quizzBuilder.withCreatedBy(userId).build();
		await quizzRepository.save(parentQuizz);

		const question = questionBuilder
			.withText('Question to update')
			.withQuizzId(parentQuizz.id)
			.build();
		await questionRepository.save(question);

		const updateProps: UpdateQuestionCommandProps = {
			id: question.id!,
			text: 'Unauthorized update attempt',
			context: { userId: differentUserId } // Different user trying to update
		};
		const command = new UpdateQuestionCommand(updateProps);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(UnauthorizedQuestionAccess);
	});
});
