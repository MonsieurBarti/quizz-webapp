export class QuizzCreatorError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'QuizzCreatorError';
	}
}

export class QuizzNotFound extends QuizzCreatorError {
	constructor(id: string) {
		super(`Quizz with id ${id} not found`);
	}
}

export class QuestionNotFound extends Error {
	constructor(questionId: string) {
		super(`Question with ID "${questionId}" not found.`);
		this.name = 'QuestionNotFound';
	}
}

export class AnswerNotFound extends Error {
	constructor(answerId: string) {
		super(`Answer with ID "${answerId}" not found.`);
		this.name = 'AnswerNotFound';
	}
}
