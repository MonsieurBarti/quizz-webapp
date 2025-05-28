import { createTRPCRouter } from '@/server/api/trpc';
import { quizzRouter } from './quizz/quizz.router';
import { questionRouter } from './question/question.router';
import { answerRouter } from './answer/answer.router';
import { playerRouter } from './player/player.router';
import { attemptRouter } from './attempt/attempt.router';
import { responseRouter } from './response/response.router';

export const quizzTakerRouter = createTRPCRouter({
	quizz: quizzRouter,
	question: questionRouter,
	answer: answerRouter,
	player: playerRouter,
	attempt: attemptRouter,
	response: responseRouter,
});
