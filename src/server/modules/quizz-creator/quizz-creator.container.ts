import 'reflect-metadata';

import { Container } from 'inversify';
import { QUIZZ_CREATOR_TOKENS } from './quizz-creator.tokens';

// Repositories
import { SqlQuizzRepository } from './infrastructure/persistence/quizz/sql-quizz.repository';
import { SqlQuestionRepository } from './infrastructure/persistence/question/sql-question.repository';
import { SqlAnswerRepository } from './infrastructure/persistence/answer/sql-answer.repository';

// Command Handlers
import { CreateQuizzCommandHandler } from './application/commands/quizz/create-quizz/create-quizz.command';
import { UpdateQuizzCommandHandler } from './application/commands/quizz/update-quizz/update-quizz.command';
import { DeleteQuizzCommandHandler } from './application/commands/quizz/delete-quizz/delete-quizz.command';
import { CreateQuestionCommandHandler } from './application/commands/question/create-question/create-question.command';
import { UpdateQuestionCommandHandler } from './application/commands/question/update-question/update-question.command';
import { DeleteQuestionCommandHandler } from './application/commands/question/delete-question/delete-question.command';
import { CreateAnswerCommandHandler } from './application/commands/answer/create-answer/create-answer.command';
import { UpdateAnswerCommandHandler } from './application/commands/answer/update-answer/update-answer.command';
import { DeleteAnswerCommandHandler } from './application/commands/answer/delete-answer/delete-answer.command';

// Query Handlers
import { GetAllQuizzQueryHandler } from './application/queries/quizz/get-all-quizz/get-all-quizz.query';
import { GetQuizzByIdQueryHandler } from './application/queries/quizz/get-quizz-by-id/get-quizz-by-id.query';
import { GetAllQuestionsQueryHandler } from './application/queries/question/get-all-questions/get-all-questions.query';
import { GetQuestionByIdQueryHandler } from './application/queries/question/get-question-by-id/get-question-by-id.query';
import { GetAllAnswersQueryHandler } from './application/queries/answer/get-all-answers/get-all-answers.query';
import { GetAnswerByIdQueryHandler } from './application/queries/answer/get-answer-by-id/get-answer-by-id.query';

const quizzCreatorContainer = new Container();

// Quizz Bindings
quizzCreatorContainer.bind(QUIZZ_CREATOR_TOKENS.QUIZZ_REPOSITORY).to(SqlQuizzRepository).inSingletonScope();
quizzCreatorContainer
	.bind(QUIZZ_CREATOR_TOKENS.CREATE_QUIZZ_COMMAND_HANDLER)
	.to(CreateQuizzCommandHandler)
	.inSingletonScope();
quizzCreatorContainer
	.bind(QUIZZ_CREATOR_TOKENS.DELETE_QUIZZ_COMMAND_HANDLER)
	.to(DeleteQuizzCommandHandler)
	.inSingletonScope();
quizzCreatorContainer
	.bind(QUIZZ_CREATOR_TOKENS.UPDATE_QUIZZ_COMMAND_HANDLER)
	.to(UpdateQuizzCommandHandler)
	.inSingletonScope();

// Question Bindings
quizzCreatorContainer.bind(QUIZZ_CREATOR_TOKENS.QUESTION_REPOSITORY).to(SqlQuestionRepository).inSingletonScope();
quizzCreatorContainer
	.bind(QUIZZ_CREATOR_TOKENS.CREATE_QUESTION_COMMAND_HANDLER)
	.to(CreateQuestionCommandHandler)
	.inSingletonScope();
quizzCreatorContainer
	.bind(QUIZZ_CREATOR_TOKENS.DELETE_QUESTION_COMMAND_HANDLER)
	.to(DeleteQuestionCommandHandler)
	.inSingletonScope();
quizzCreatorContainer
	.bind(QUIZZ_CREATOR_TOKENS.UPDATE_QUESTION_COMMAND_HANDLER)
	.to(UpdateQuestionCommandHandler)
	.inSingletonScope();

// Answer Bindings
quizzCreatorContainer.bind(QUIZZ_CREATOR_TOKENS.ANSWER_REPOSITORY).to(SqlAnswerRepository).inSingletonScope();
quizzCreatorContainer
	.bind(QUIZZ_CREATOR_TOKENS.CREATE_ANSWER_COMMAND_HANDLER)
	.to(CreateAnswerCommandHandler)
	.inSingletonScope();
quizzCreatorContainer
	.bind(QUIZZ_CREATOR_TOKENS.UPDATE_ANSWER_COMMAND_HANDLER)
	.to(UpdateAnswerCommandHandler)
	.inSingletonScope();
quizzCreatorContainer
	.bind(QUIZZ_CREATOR_TOKENS.DELETE_ANSWER_COMMAND_HANDLER)
	.to(DeleteAnswerCommandHandler)
	.inSingletonScope();

// Query Handler Bindings
// Quizz Query Handlers
quizzCreatorContainer
	.bind(QUIZZ_CREATOR_TOKENS.GET_ALL_QUIZZ_QUERY_HANDLER)
	.to(GetAllQuizzQueryHandler)
	.inSingletonScope();
quizzCreatorContainer
	.bind(QUIZZ_CREATOR_TOKENS.GET_QUIZZ_BY_ID_QUERY_HANDLER)
	.to(GetQuizzByIdQueryHandler)
	.inSingletonScope();

// Question Query Handlers
quizzCreatorContainer
	.bind(QUIZZ_CREATOR_TOKENS.GET_ALL_QUESTIONS_QUERY_HANDLER)
	.to(GetAllQuestionsQueryHandler)
	.inSingletonScope();
quizzCreatorContainer
	.bind(QUIZZ_CREATOR_TOKENS.GET_QUESTION_BY_ID_QUERY_HANDLER)
	.to(GetQuestionByIdQueryHandler)
	.inSingletonScope();

// Answer Query Handlers
quizzCreatorContainer
	.bind(QUIZZ_CREATOR_TOKENS.GET_ALL_ANSWERS_QUERY_HANDLER)
	.to(GetAllAnswersQueryHandler)
	.inSingletonScope();
quizzCreatorContainer
	.bind(QUIZZ_CREATOR_TOKENS.GET_ANSWER_BY_ID_QUERY_HANDLER)
	.to(GetAnswerByIdQueryHandler)
	.inSingletonScope();

export { quizzCreatorContainer };
