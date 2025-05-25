import 'reflect-metadata';
import { GetAllAnswersQuery, GetAllAnswersQueryHandler } from './get-all-answers.query';
import { InMemoryAnswerRepository } from '@quizz-creator/infrastructure/persistence/answer/in-memory-answer.repository';
import { InMemoryQuestionRepository } from '@quizz-creator/infrastructure/persistence/question/in-memory-question.repository';
import { AnswerBuilder } from '@quizz-creator/domain/answer/answer.builder';
import { QuestionBuilder } from '@quizz-creator/domain/question/question.builder';
import { Answer } from '@quizz-creator/domain/answer/answer';

describe('GetAllAnswersQueryHandler', () => {
	let answerRepository: InMemoryAnswerRepository;
	let questionRepository: InMemoryQuestionRepository; // To create questions
	let handler: GetAllAnswersQueryHandler;

	beforeEach(async () => {
		answerRepository = new InMemoryAnswerRepository();
		questionRepository = new InMemoryQuestionRepository();
		handler = new GetAllAnswersQueryHandler(answerRepository);
	});

	it('should return all answers for a specific questionId', async () => {
		// Arrange
		const question1 = new QuestionBuilder().build();
		await questionRepository.save(question1);

		const question2 = new QuestionBuilder().build(); // Another question
		await questionRepository.save(question2);

		const answer1Q1 = new AnswerBuilder()
			.withQuestionId(question1.id!)
			.withText('Answer 1 for Q1')
			.withOrder(0)
			.build();
		const answer2Q1 = new AnswerBuilder()
			.withQuestionId(question1.id!)
			.withText('Answer 2 for Q1')
			.withOrder(1)
			.build();
		const answer1Q2 = new AnswerBuilder().withQuestionId(question2.id!).withText('Answer 1 for Q2').build(); // Answer for a different question

		await answerRepository.save(answer1Q1);
		await answerRepository.save(answer2Q1);
		await answerRepository.save(answer1Q2);

		const query = new GetAllAnswersQuery({ questionId: question1.id! });

		// Act
		const result = await handler.execute(query);

		// Assert
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(2);
		expect(result.every(ans => ans instanceof Answer)).toBe(true);
		expect(result.some(ans => ans.id === answer1Q1.id)).toBe(true);
		expect(result.some(ans => ans.id === answer2Q1.id)).toBe(true);
		expect(result.every(ans => ans.questionId === question1.id!)).toBe(true);
	});

	it('should return an empty array if no answers exist for the questionId', async () => {
		// Arrange
		const questionWithNoAnswers = new QuestionBuilder().build();
		await questionRepository.save(questionWithNoAnswers);

		const query = new GetAllAnswersQuery({ questionId: questionWithNoAnswers.id! });

		// Act
		const result = await handler.execute(query);

		// Assert
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(0);
	});

	it('should return an empty array if the questionId does not exist', async () => {
		// Arrange
		const nonExistentQuestionId = '00000000-0000-0000-0000-000000000000';
		const query = new GetAllAnswersQuery({ questionId: nonExistentQuestionId });

		// Act
		const result = await handler.execute(query);

		// Assert
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(0);
	});
});
