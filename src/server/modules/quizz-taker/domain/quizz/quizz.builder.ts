import { faker } from '@faker-js/faker';
import { Quizz, QuizzProps } from './quizz';

export class QuizzBuilder {
	private props: QuizzProps;

	constructor() {
		this.props = {
			id: faker.string.uuid(),
			title: faker.lorem.sentence({ min: 3, max: 10 }),
			description: faker.datatype.boolean() ? faker.lorem.paragraph() : null,
			isPublished: faker.datatype.boolean(),
			createdBy: faker.string.uuid(),
		};
	}

	public withId(id: string | null): this {
		this.props.id = id;
		return this;
	}

	public withTitle(title: string): this {
		this.props.title = title;
		return this;
	}

	public withDescription(description: string | null): this {
		this.props.description = description;
		return this;
	}

	public withIsPublished(isPublished: boolean): this {
		this.props.isPublished = isPublished;
		return this;
	}

	public withCreatedBy(createdBy: string): this {
		this.props.createdBy = createdBy;
		return this;
	}

	public build(): Quizz {
		return Quizz.create(this.props);
	}
}
