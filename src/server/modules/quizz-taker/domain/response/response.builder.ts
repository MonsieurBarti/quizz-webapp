import { faker } from '@faker-js/faker';
import { Response, ResponseProps } from './response';

export class ResponseBuilder {
	private props: Partial<ResponseProps>;

	constructor() {
		this.props = {
			id: faker.string.uuid(),
			attemptId: faker.string.uuid(),
			questionId: faker.string.uuid(),
			answerId: faker.string.uuid(),
			isCorrect: faker.datatype.boolean(),
			timeTakenMs: faker.number.int({ min: 1000, max: 60000 }),
		};
	}

	public withId(id: string | null): this {
		this.props.id = id;
		return this;
	}

	public withAttemptId(attemptId: string): this {
		this.props.attemptId = attemptId;
		return this;
	}

	public withQuestionId(questionId: string): this {
		this.props.questionId = questionId;
		return this;
	}

	public withAnswerId(answerId: string): this {
		this.props.answerId = answerId;
		return this;
	}

	public withIsCorrect(isCorrect: boolean): this {
		this.props.isCorrect = isCorrect;
		return this;
	}

	public withTimeTakenMs(timeTakenMs: number): this {
		this.props.timeTakenMs = timeTakenMs;
		return this;
	}

	public build(): Response {
		const finalProps: ResponseProps = {
			id: this.props.id ?? faker.string.uuid(),
			attemptId: this.props.attemptId ?? faker.string.uuid(),
			questionId: this.props.questionId ?? faker.string.uuid(),
			answerId: this.props.answerId ?? faker.string.uuid(),
			isCorrect: this.props.isCorrect ?? faker.datatype.boolean(),
			timeTakenMs: this.props.timeTakenMs ?? faker.number.int({ min: 1000, max: 60000 }),
		};
		return Response.create(finalProps);
	}
}
