import 'reflect-metadata';
import { DeleteAnswerCommand, DeleteAnswerCommandHandler, DeleteAnswerCommandProps } from './delete-answer.command';
import { InMemoryAnswerRepository } from '@quizz-creator/infrastructure/persistence/answer/in-memory-answer.repository';
import { InMemoryQuestionRepository } from '@quizz-creator/infrastructure/persistence/question/in-memory-question.repository';
import { InMemoryQuizzRepository } from '@quizz-creator/infrastructure/persistence/quizz/in-memory-quizz.repository';
import { AnswerBuilder } from '@quizz-creator/domain/answer/answer.builder';
import { QuestionBuilder } from '@quizz-creator/domain/question/question.builder';
import { QuizzBuilder } from '@quizz-creator/domain/quizz/quizz.builder';
import { AnswerNotFound, UnauthorizedAnswerAccess } from '@quizz-creator/domain/errors/quizz-creator.errors';
import { Question } from '@quizz-creator/domain/question/question';

describe('DeleteAnswerCommandHandler', () => {
	let answerRepository: InMemoryAnswerRepository;
	let questionRepository: InMemoryQuestionRepository;
	let quizzRepository: InMemoryQuizzRepository;
	let handler: DeleteAnswerCommandHandler;
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
		handler = new DeleteAnswerCommandHandler(answerRepository, questionRepository, quizzRepository);
		questionBuilder = new QuestionBuilder();
		quizzBuilder = new QuizzBuilder();
		answerBuilder = new AnswerBuilder();

		const existingQuizz = quizzBuilder.withCreatedBy(userId).build();
		await quizzRepository.save(existingQuizz);

		existingQuestion = questionBuilder.withQuizzId(existingQuizz.id).build();
		await questionRepository.save(existingQuestion);
	});

	it('should delete an existing answer successfully', async () => {
		// Arrange
		const answerToDelete = answerBuilder.withQuestionId(existingQuestion.id!).build();
		await answerRepository.save(answerToDelete);
		expect(await answerRepository.findById({ id: answerToDelete.id! })).toBeDefined(); // Ensure it's there

		const commandProps: DeleteAnswerCommandProps = {
			id: answerToDelete.id!,
			context: { userId }
		};
		const command = new DeleteAnswerCommand(commandProps);

		// Act
		await handler.execute(command);

		// Assert
		const deletedAnswer = await answerRepository.findById({ id: answerToDelete.id! });
		expect(deletedAnswer).toBeNull();
	});

	it('should throw AnswerNotFound if the answer to delete does not exist', async () => {
		// Arrange
		const nonExistentAnswerId = '00000000-0000-0000-0000-000000000000';
		const commandProps: DeleteAnswerCommandProps = {
			id: nonExistentAnswerId,
			context: { userId }
		};
		const command = new DeleteAnswerCommand(commandProps);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(AnswerNotFound);
		await expect(handler.execute(command)).rejects.toThrow(`Answer with ID "${nonExistentAnswerId}" not found.`);
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

		const deleteProps: DeleteAnswerCommandProps = {
			id: answer.id!,
			context: { userId: differentUserId } // Different user trying to delete
		};
		const command = new DeleteAnswerCommand(deleteProps);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(UnauthorizedAnswerAccess);
	});
});
