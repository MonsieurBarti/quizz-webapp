import { faker } from '@faker-js/faker';
import { Question, QuestionProps } from './question';
import crypto from 'crypto';

export class QuestionBuilder {
	private props: Partial<QuestionProps> = {};

	constructor() {
		// Set default values using faker
		this.props.quizzId = crypto.randomUUID(); // Default, can be overridden
		this.props.text = faker.lorem.sentence();
		this.props.order = faker.number.int({ min: 0, max: 10 });
		this.props.imageUrl = faker.datatype.boolean() ? faker.image.url() : null;
	}

	withId(id: string | null): this {
		this.props.id = id;
		return this;
	}

	withQuizzId(quizzId: string): this {
		this.props.quizzId = quizzId;
		return this;
	}

	withText(text: string): this {
		this.props.text = text;
		return this;
	}

	withOrder(order: number): this {
		this.props.order = order;
		return this;
	}

	withImageUrl(imageUrl: string | null): this {
		this.props.imageUrl = imageUrl;
		return this;
	}

	build(): Question {
		// Ensure all required fields for QuestionProps are present before calling Question.create
		// 'id' is optional for Question.create as it can generate one.
		const completeProps: QuestionProps = {
			id: this.props.id !== undefined ? this.props.id : undefined, // Pass undefined if not set, so Question.create generates it
			quizzId: this.props.quizzId ?? crypto.randomUUID(), // Fallback if not set
			text: this.props.text ?? 'Default question text',
			order: this.props.order ?? 0,
			imageUrl: this.props.imageUrl !== undefined ? this.props.imageUrl : null,
		};
		return Question.create(completeProps);
	}
}
