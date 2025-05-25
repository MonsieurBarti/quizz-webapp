import { faker } from '@faker-js/faker';
import { Answer, AnswerProps } from './answer';

export class AnswerBuilder {
	private props: AnswerProps;

	constructor() {
		this.props = {
			id: faker.string.uuid(),
			questionId: faker.string.uuid(),
			text: faker.lorem.words({ min: 1, max: 5 }),
			isCorrect: faker.datatype.boolean(),
			order: faker.number.int({ min: 0, max: 3 }),
			nextQuestionId: faker.datatype.boolean({ probability: 0.25 }) ? faker.string.uuid() : null, // 25% chance of having a next question
		};
	}

	public withId(id: string | null): this {
		this.props.id = id;
		return this;
	}

	public withQuestionId(questionId: string): this {
		this.props.questionId = questionId;
		return this;
	}

	public withText(text: string): this {
		this.props.text = text;
		return this;
	}

	public withIsCorrect(isCorrect: boolean): this {
		this.props.isCorrect = isCorrect;
		return this;
	}

	public withOrder(order: number): this {
		this.props.order = order;
		return this;
	}

	public withNextQuestionId(nextQuestionId: string | null): this {
		this.props.nextQuestionId = nextQuestionId;
		return this;
	}

	public build(): Answer {
		return Answer.create(this.props);
	}
}
