import 'reflect-metadata';
import { CreateAnswerCommand, CreateAnswerCommandHandler, CreateAnswerCommandProps } from './create-answer.command';
import { InMemoryAnswerRepository } from '@quizz-creator/infrastructure/persistence/answer/in-memory-answer.repository';
import { InMemoryQuestionRepository } from '@quizz-creator/infrastructure/persistence/question/in-memory-question.repository';
import { AnswerBuilder } from '@quizz-creator/domain/answer/answer.builder';
import { QuestionBuilder } from '@quizz-creator/domain/question/question.builder';
import { QuestionNotFound } from '@quizz-creator/domain/errors/quizz-creator.errors';
import { Answer } from '@quizz-creator/domain/answer/answer';

describe('CreateAnswerCommandHandler', () => {
	let answerRepository: InMemoryAnswerRepository;
	let questionRepository: InMemoryQuestionRepository;
	let handler: CreateAnswerCommandHandler;
	let questionBuilder: QuestionBuilder;
	let answerBuilder: AnswerBuilder;

	beforeEach(() => {
		answerRepository = new InMemoryAnswerRepository();
		questionRepository = new InMemoryQuestionRepository();
		handler = new CreateAnswerCommandHandler(answerRepository, questionRepository);
		questionBuilder = new QuestionBuilder();
		answerBuilder = new AnswerBuilder();
	});

	it('should create and save an answer successfully when question exists', async () => {
		// Arrange
		const existingQuestion = questionBuilder.withId(null).build(); // Let builder generate ID or Question.create
		await questionRepository.save(existingQuestion);

		const builtAnswer = answerBuilder
			.withId(null) // Let the domain entity generate the ID
			.withQuestionId(existingQuestion.id!)
			.withText('What is 2+2?')
			.withIsCorrect(true)
			.withOrder(0)
			.withNextQuestionId(null)
			.build();

		// Construct props for the command from the built answer
		const commandProps: CreateAnswerCommandProps = {
			id: builtAnswer.id, // This will be null if not set, which is fine for create
			questionId: builtAnswer.questionId,
			text: builtAnswer.text,
			isCorrect: builtAnswer.isCorrect,
			order: builtAnswer.order,
			nextQuestionId: builtAnswer.nextQuestionId,
		};

		const command = new CreateAnswerCommand(commandProps);

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(result).toBeInstanceOf(Answer);
		expect(result.id).toBeDefined();
		expect(result.questionId).toBe(existingQuestion.id);
		expect(result.text).toBe(commandProps.text);
		expect(result.isCorrect).toBe(commandProps.isCorrect);
		expect(result.order).toBe(commandProps.order);

		const savedAnswer = await answerRepository.findById({ id: result.id! });
		expect(savedAnswer).toEqual(result);
	});

	it('should throw QuestionNotFound error if the questionId does not exist', async () => {
		// Arrange
		const nonExistentQuestionId = '00000000-0000-0000-0000-000000000000'; // A valid UUID that won't exist

		const builtAnswerForNonExistentQuestion = answerBuilder
			.withId(null)
			.withQuestionId(nonExistentQuestionId)
			.build();

		const commandProps: CreateAnswerCommandProps = {
			id: builtAnswerForNonExistentQuestion.id,
			questionId: builtAnswerForNonExistentQuestion.questionId,
			text: builtAnswerForNonExistentQuestion.text,
			isCorrect: builtAnswerForNonExistentQuestion.isCorrect,
			order: builtAnswerForNonExistentQuestion.order,
			nextQuestionId: builtAnswerForNonExistentQuestion.nextQuestionId,
		};

		const command = new CreateAnswerCommand(commandProps);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(QuestionNotFound);
		await expect(handler.execute(command)).rejects.toThrow(
			`Question with ID "${nonExistentQuestionId}" not found.`,
		);
	});

	it('should allow creating an answer with a specific ID if provided', async () => {
		// Arrange
		const existingQuestion = questionBuilder.withId(null).build();
		await questionRepository.save(existingQuestion);

		const specificAnswerId = '11111111-1111-1111-1111-111111111111';
		const builtAnswerWithSpecificId = answerBuilder
			.withId(specificAnswerId)
			.withQuestionId(existingQuestion.id!)
			.build();

		const commandProps: CreateAnswerCommandProps = {
			id: builtAnswerWithSpecificId.id,
			questionId: builtAnswerWithSpecificId.questionId,
			text: builtAnswerWithSpecificId.text,
			isCorrect: builtAnswerWithSpecificId.isCorrect,
			order: builtAnswerWithSpecificId.order,
			nextQuestionId: builtAnswerWithSpecificId.nextQuestionId,
		};

		const command = new CreateAnswerCommand(commandProps);

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(result.id).toBe(specificAnswerId);
		const savedAnswer = await answerRepository.findById({ id: specificAnswerId });
		expect(savedAnswer).toBeDefined();
		expect(savedAnswer?.id).toBe(specificAnswerId);
	});
});
