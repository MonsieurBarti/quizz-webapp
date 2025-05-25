import 'reflect-metadata';
import { UpdateQuizzCommand, UpdateQuizzCommandHandler, UpdateQuizzCommandProps } from './update-quizz.command';
import { InMemoryQuizzRepository } from '@quizz-creator/infrastructure/persistence/quizz/in-memory-quizz.repository';
import { QuizzBuilder } from '@quizz-creator/domain/quizz/quizz.builder';
import { QuizzNotFound } from '@quizz-creator/domain/errors/quizz-creator.errors';
import { Quizz } from '@quizz-creator/domain/quizz/quizz';

describe('UpdateQuizzCommandHandler', () => {
	let quizzRepository: InMemoryQuizzRepository;
	let handler: UpdateQuizzCommandHandler;
	let quizzBuilder: QuizzBuilder;
	let existingQuizz: Quizz;

	beforeEach(async () => {
		quizzRepository = new InMemoryQuizzRepository();
		handler = new UpdateQuizzCommandHandler(quizzRepository);
		quizzBuilder = new QuizzBuilder();

		existingQuizz = quizzBuilder.build();
		await quizzRepository.save(existingQuizz);
	});

	it('should update an existing quizz successfully', async () => {
		// Arrange
		const initialQuizz = quizzBuilder
			.withTitle('Old title')
			.withDescription('Old description')
			.withIsPublished(false)
			.build();
		await quizzRepository.save(initialQuizz);

		const updateProps: UpdateQuizzCommandProps = {
			id: initialQuizz.id!,
			title: 'New updated title',
			description: 'New updated description',
			isPublished: true,
		};
		const command = new UpdateQuizzCommand(updateProps);

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(result).toBeInstanceOf(Quizz);
		expect(result.id).toBe(initialQuizz.id);
		expect(result.title).toBe(updateProps.title);
		expect(result.description).toBe(updateProps.description);
		expect(result.isPublished).toBe(updateProps.isPublished);

		const savedQuizz = await quizzRepository.findById({ id: initialQuizz.id! });
		expect(savedQuizz?.title).toBe(updateProps.title);
		expect(savedQuizz?.description).toBe(updateProps.description);
		expect(savedQuizz?.isPublished).toBe(updateProps.isPublished);
	});

	it('should throw QuizzNotFound if the quizz to update does not exist', async () => {
		// Arrange
		const nonExistentQuizzId = '00000000-0000-0000-0000-000000000000';
		const commandProps: UpdateQuizzCommandProps = {
			id: nonExistentQuizzId,
			title: 'Title for a ghost quizz',
			description: 'Description for a ghost quizz',
			isPublished: true,
		};
		const command = new UpdateQuizzCommand(commandProps);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(QuizzNotFound);
		await expect(handler.execute(command)).rejects.toThrow(`Quizz with id ${nonExistentQuizzId} not found`);
	});

	it('should partially update an quizz if only some fields are provided', async () => {
		// Arrange
		const initialQuizz = quizzBuilder
			.withTitle('Initial Title')
			.withDescription('Initial Description')
			.withIsPublished(false)
			.build();
		await quizzRepository.save(initialQuizz);

		const partialUpdateProps: UpdateQuizzCommandProps = {
			id: initialQuizz.id!,
			title: 'Partially Updated Title',
			// isCorrect and order are not provided
		};
		const command = new UpdateQuizzCommand(partialUpdateProps);

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(result.title).toBe(partialUpdateProps.title);
		expect(result.description).toBe(initialQuizz.description); // Should remain unchanged
		expect(result.isPublished).toBe(initialQuizz.isPublished); // Should remain unchanged

		const savedQuizz = await quizzRepository.findById({ id: initialQuizz.id! });
		expect(savedQuizz?.title).toBe(partialUpdateProps.title);
		expect(savedQuizz?.description).toBe(initialQuizz.description);
		expect(savedQuizz?.isPublished).toBe(initialQuizz.isPublished);
	});
});
