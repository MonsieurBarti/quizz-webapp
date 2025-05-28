export class QuizzTakerError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'QuizzTakerError';
	}
}

export class AttemptAlreadyCompleted extends QuizzTakerError {
	constructor() {
		super('Attempt is already completed');
	}
}

export class QuizzNotFound extends QuizzTakerError {
	constructor(id: string) {
		super(`Quizz with id ${id} not found`);
	}
}

export class QuestionNotFound extends QuizzTakerError {
	constructor(id: string) {
		super(`Question with id ${id} not found`);
	}
}

export class AnswerNotFound extends QuizzTakerError {
	constructor(id: string) {
		super(`Answer with id ${id} not found`);
	}
}
