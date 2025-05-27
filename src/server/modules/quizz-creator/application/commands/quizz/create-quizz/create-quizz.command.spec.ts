import crypto from 'crypto';
import { InMemoryQuizzRepository } from '@quizz-creator/infrastructure/persistence/quizz/in-memory-quizz.repository';
import { CreateQuizzCommand, CreateQuizzCommandHandler, CreateQuizzCommandProps } from './create-quizz.command';
import { QuizzBuilder } from '@quizz-creator/domain/quizz/quizz.builder';
import { UnauthorizedQuizzAccess } from '@quizz-creator/domain/errors/quizz-creator.errors';

describe('CreateQuizzCommandHandler', () => {
	let quizzRepository: InMemoryQuizzRepository;
	let handler: CreateQuizzCommandHandler;
	const userId = '11111111-1111-1111-1111-111111111111';
	const differentUserId = '22222222-2222-2222-2222-222222222222';

	beforeEach(() => {
		quizzRepository = new InMemoryQuizzRepository();
		handler = new CreateQuizzCommandHandler(quizzRepository);
	});

	it('should create and save a new quizz with a specific id from builder', async () => {
		const specificId = crypto.randomUUID();
		const builtQuizz = new QuizzBuilder()
			.withId(specificId)
			.withTitle('My Test Quizz')
			.withDescription('A description for the test quizz.')
			.withCreatedBy(crypto.randomUUID())
			.build();

		const commandProps: CreateQuizzCommandProps = {
			id: builtQuizz.id,
			title: builtQuizz.title,
			description: builtQuizz.description,
			createdBy: builtQuizz.createdBy,
		};

		const command = new CreateQuizzCommand(commandProps);

		// Act
		await handler.execute(command);

		// Assert
		const createdQuizz = await quizzRepository.findById({ id: specificId });
		expect(createdQuizz).toBeDefined();
		expect(createdQuizz).not.toBeNull();
		expect(createdQuizz?.id).toBe(builtQuizz.id);
		expect(createdQuizz?.title).toBe(builtQuizz.title);
		expect(createdQuizz?.description).toBe(builtQuizz.description);
		expect(createdQuizz?.createdBy).toBe(builtQuizz.createdBy);
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

		const commandProps: CreateQuizzCommandProps = {
			id: builtQuizz.id,
			title: builtQuizz.title,
			description: builtQuizz.description,
			createdBy: builtQuizz.createdBy,
		};

		const command = new CreateQuizzCommand(commandProps);

		// Act
		await handler.execute(command);

		// Assert
		const createdQuizz = await quizzRepository.findById({ id: specificId });
		expect(createdQuizz).toBeDefined();
		expect(createdQuizz).not.toBeNull();
		expect(createdQuizz?.id).toBe(builtQuizz.id);
		expect(createdQuizz?.title).toBe(builtQuizz.title);
		expect(createdQuizz?.description).toBe(builtQuizz.description);
		expect(createdQuizz?.createdBy).toBe(builtQuizz.createdBy);
	});

	it('should create a quizz with a generated id if no id is provided in command', async () => {
		const builtQuizz = new QuizzBuilder()
			.withTitle('Quizz With Generated ID')
			.withDescription('Description here')
			.withCreatedBy(crypto.randomUUID())
			.build();

		const commandProps: CreateQuizzCommandProps = {
			title: builtQuizz.title,
			description: builtQuizz.description,
			createdBy: builtQuizz.createdBy,
		};

		const command = new CreateQuizzCommand(commandProps);

		// Act
		await handler.execute(command);

		// Assert
		const allQuizzes = await quizzRepository.findByCreatorId({ creatorId: builtQuizz.createdBy });
		expect(allQuizzes).toHaveLength(1);
		expect(allQuizzes[0]).toBeDefined();
		expect(allQuizzes[0]).not.toBeNull();
		expect(allQuizzes[0]?.id).toBeDefined();
		expect(allQuizzes[0]?.title).toBe(builtQuizz.title);
		expect(allQuizzes[0]?.description).toBe(builtQuizz.description);
		expect(allQuizzes[0]?.createdBy).toBe(builtQuizz.createdBy);
	});
});
