import crypto from 'crypto';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InMemoryQuizzRepository } from '@quizz-creator/infrastructure/persistence/quizz/in-memory-quizz.repository';
import { CreateQuizzCommand, CreateQuizzCommandHandler, CreateQuizzCommandProps } from './create-quizz.command';
import { QuizzBuilder } from '@quizz-creator/domain/quizz/quizz.builder';
import type { Quizz } from '@quizz-creator/domain/quizz/quizz';

describe('CreateQuizzCommandHandler', () => {
	let quizzRepository: InMemoryQuizzRepository;
	let handler: CreateQuizzCommandHandler;

	beforeEach(() => {
		quizzRepository = new InMemoryQuizzRepository();
		handler = new CreateQuizzCommandHandler(quizzRepository);

		vi.spyOn(quizzRepository, 'save');
		vi.spyOn(quizzRepository, 'findById');
		vi.spyOn(quizzRepository, 'findByCreatorId');
	});

	function createQuizzCommand(overrides: Partial<CreateQuizzCommandProps> = {}): CreateQuizzCommand {
		const defaultProps: CreateQuizzCommandProps = {
			title: 'Default Test Quizz',
			description: 'Default description',
			createdBy: crypto.randomUUID(),
			...overrides,
		};

		return new CreateQuizzCommand(defaultProps);
	}

	async function assertQuizzCreated(quizz: Quizz) {
		const createdQuizz = await quizzRepository.findById({ id: quizz.id });
		expect(createdQuizz).toBeDefined();
		expect(createdQuizz).not.toBeNull();
		expect(createdQuizz?.id).toBe(quizz.id);
		expect(createdQuizz?.title).toBe(quizz.title);
		expect(createdQuizz?.description).toBe(quizz.description);
		expect(createdQuizz?.createdBy).toBe(quizz.createdBy);
	}

	it('should create and save a new quizz with a specific id from builder', async () => {
		// Arrange
		const specificId = crypto.randomUUID();
		const builtQuizz = new QuizzBuilder()
			.withId(specificId)
			.withTitle('My Test Quizz')
			.withDescription('A description for the test quizz.')
			.withCreatedBy(crypto.randomUUID())
			.build();

		const command = createQuizzCommand({
			id: builtQuizz.id,
			title: builtQuizz.title,
			description: builtQuizz.description,
			createdBy: builtQuizz.createdBy,
		});

		// Act
		await handler.execute(command);

		// Assert
		expect(quizzRepository.save).toHaveBeenCalledTimes(1);
		await assertQuizzCreated(builtQuizz);
	});

	it('should create a quizz with a null description and a specific id', async () => {
		// Arrange
		const specificId = crypto.randomUUID();
		const userId = crypto.randomUUID();
		const builtQuizz = new QuizzBuilder()
			.withId(specificId)
			.withTitle('Quizz Without Description')
			.withCreatedBy(userId)
			.withDescription(null)
			.build();

		const command = createQuizzCommand({
			id: builtQuizz.id,
			title: builtQuizz.title,
			description: builtQuizz.description,
			createdBy: builtQuizz.createdBy,
		});

		// Act
		await handler.execute(command);

		// Assert
		expect(quizzRepository.save).toHaveBeenCalledTimes(1);
		await assertQuizzCreated(builtQuizz);
	});

	it('should create a quizz with a generated id if no id is provided in command', async () => {
		// Arrange
		const builtQuizz = new QuizzBuilder()
			.withTitle('Quizz With Generated ID')
			.withDescription('Description here')
			.withCreatedBy(crypto.randomUUID())
			.build();

		const command = createQuizzCommand({
			title: builtQuizz.title,
			description: builtQuizz.description,
			createdBy: builtQuizz.createdBy,
			// id is intentionally omitted
		});

		// Act
		await handler.execute(command);

		// Assert
		expect(quizzRepository.save).toHaveBeenCalledTimes(1);
		
		// We don't need to check if findByCreatorId was called with specific parameters
		// because the implementation might not call it directly
		const allQuizzes = await quizzRepository.findByCreatorId({ creatorId: builtQuizz.createdBy });
		expect(allQuizzes).toHaveLength(1);
		expect(allQuizzes[0]).toBeDefined();
		expect(allQuizzes[0]?.id).toBeDefined();
		expect(allQuizzes[0]?.title).toBe(builtQuizz.title);
		expect(allQuizzes[0]?.description).toBe(builtQuizz.description);
		expect(allQuizzes[0]?.createdBy).toBe(builtQuizz.createdBy);
	});
});
