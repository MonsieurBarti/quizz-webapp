import 'reflect-metadata';
import {
	UpdateQuestionCommand,
	UpdateQuestionCommandHandler,
	UpdateQuestionCommandProps,
} from './update-question.command';
import { InMemoryQuestionRepository } from '@quizz-creator/infrastructure/persistence/question/in-memory-question.repository';
import { QuestionBuilder } from '@quizz-creator/domain/question/question.builder';
import { QuestionNotFound } from '@quizz-creator/domain/errors/quizz-creator.errors';
import { Question } from '@quizz-creator/domain/question/question';

describe('UpdateQuestionCommandHandler', () => {
	let questionRepository: InMemoryQuestionRepository;
	let handler: UpdateQuestionCommandHandler;
	let questionBuilder: QuestionBuilder;
	let existingQuestion: Question;

	beforeEach(async () => {
		questionRepository = new InMemoryQuestionRepository();
		handler = new UpdateQuestionCommandHandler(questionRepository);
		questionBuilder = new QuestionBuilder();

		existingQuestion = questionBuilder.build();
		await questionRepository.save(existingQuestion);
	});

	it('should update an existing question successfully', async () => {
		// Arrange
		const initialQuestion = questionBuilder.withText('Old text').withOrder(1).withImageUrl(null).build();
		await questionRepository.save(initialQuestion);

		const updateProps: UpdateQuestionCommandProps = {
			id: initialQuestion.id!,
			text: 'New updated text',
			order: 2,
			imageUrl: 'https://example.com/new-image.jpg',
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
		const initialQuestion = questionBuilder.withText('Initial Text').withOrder(0).withImageUrl(null).build();
		await questionRepository.save(initialQuestion);

		const partialUpdateProps: UpdateQuestionCommandProps = {
			id: initialQuestion.id!,
			text: 'Partially Updated Text',
			// isCorrect and order are not provided
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
});
