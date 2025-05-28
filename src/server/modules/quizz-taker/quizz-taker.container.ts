import 'reflect-metadata';

import { Container } from 'inversify';
import { QUIZZ_TAKER_TOKENS } from './quizz-taker.tokens';
import { GetAllQuizzQueryHandler } from './application/queries/quizz/get-all-quizz/get-all-quizz.query';
import { GetQuizzByIdQueryHandler } from './application/queries/quizz/get-quizz-by-id/get-quizz-by-id.query';
import { GetAllAnswersQueryHandler } from './application/queries/answer/get-all-answers/get-all-answers.query';
import { GetAnswerByIdQueryHandler } from './application/queries/answer/get-answer-by-id/get-answer-by-id.query';
import { GetAllQuestionsQueryHandler } from './application/queries/question/get-all-questions/get-all-questions.query';
import { GetQuestionByIdQueryHandler } from './application/queries/question/get-question-by-id/get-question-by-id.query';
import { SavePlayerCommandHandler } from './application/commands/save-player/save-player.command';
import { SaveAttemptCommandHandler } from './application/commands/save-attempt/save-attempt.command';
import { SaveResponseCommandHandler } from './application/commands/save-response/save-response.command';
import { SqlPlayerRepository } from './infrastructure/persistence/player/sql-player.repository';
import { SqlAttemptRepository } from './infrastructure/persistence/attempt/sql-attempt.repository';
import { SqlResponseRepository } from './infrastructure/persistence/response/sql-response.repository';
import { SqlAnswerReader } from './infrastructure/persistence/answer/sql-answer.reader';

const quizzTakerContainer = new Container();

quizzTakerContainer.bind(QUIZZ_TAKER_TOKENS.PLAYER_REPOSITORY).to(SqlPlayerRepository).inSingletonScope();
quizzTakerContainer.bind(QUIZZ_TAKER_TOKENS.ATTEMPT_REPOSITORY).to(SqlAttemptRepository).inSingletonScope();
quizzTakerContainer.bind(QUIZZ_TAKER_TOKENS.RESPONSE_REPOSITORY).to(SqlResponseRepository).inSingletonScope();
quizzTakerContainer.bind(QUIZZ_TAKER_TOKENS.ANSWER_READER).to(SqlAnswerReader).inSingletonScope();

quizzTakerContainer.bind(QUIZZ_TAKER_TOKENS.GET_ALL_QUIZZ_QUERY_HANDLER).to(GetAllQuizzQueryHandler).inSingletonScope();
quizzTakerContainer
	.bind(QUIZZ_TAKER_TOKENS.GET_QUIZZ_BY_ID_QUERY_HANDLER)
	.to(GetQuizzByIdQueryHandler)
	.inSingletonScope();
quizzTakerContainer
	.bind(QUIZZ_TAKER_TOKENS.GET_ALL_ANSWERS_QUERY_HANDLER)
	.to(GetAllAnswersQueryHandler)
	.inSingletonScope();
quizzTakerContainer
	.bind(QUIZZ_TAKER_TOKENS.GET_ANSWER_BY_ID_QUERY_HANDLER)
	.to(GetAnswerByIdQueryHandler)
	.inSingletonScope();
quizzTakerContainer
	.bind(QUIZZ_TAKER_TOKENS.GET_ALL_QUESTIONS_QUERY_HANDLER)
	.to(GetAllQuestionsQueryHandler)
	.inSingletonScope();
quizzTakerContainer
	.bind(QUIZZ_TAKER_TOKENS.GET_QUESTION_BY_ID_QUERY_HANDLER)
	.to(GetQuestionByIdQueryHandler)
	.inSingletonScope();

// Command Handlers
quizzTakerContainer
	.bind(QUIZZ_TAKER_TOKENS.SAVE_PLAYER_COMMAND_HANDLER)
	.to(SavePlayerCommandHandler)
	.inSingletonScope();
quizzTakerContainer
	.bind(QUIZZ_TAKER_TOKENS.SAVE_ATTEMPT_COMMAND_HANDLER)
	.to(SaveAttemptCommandHandler)
	.inSingletonScope();
quizzTakerContainer
	.bind(QUIZZ_TAKER_TOKENS.SAVE_RESPONSE_COMMAND_HANDLER)
	.to(SaveResponseCommandHandler)
	.inSingletonScope();

export { quizzTakerContainer };
