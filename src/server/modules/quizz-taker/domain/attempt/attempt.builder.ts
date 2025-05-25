import { faker } from '@faker-js/faker';
import { Attempt, AttemptProps } from './attempt';

export class AttemptBuilder {
	private props: Partial<AttemptProps>;

	constructor() {
		const startDate = faker.date.recent({ days: 7 });
		const totalQuestionsAnswered = faker.number.int({ min: 5, max: 20 });
		const score = faker.number.int({ min: 0, max: totalQuestionsAnswered });
		const isCompleted = faker.datatype.boolean();

		this.props = {
			id: faker.string.uuid(),
			quizzId: faker.string.uuid(),
			playerId: faker.string.uuid(),
			startedAt: startDate,
			completedAt: isCompleted ? faker.date.between({ from: startDate, to: new Date() }) : null,
			score: score,
			totalQuestionsAnswered: totalQuestionsAnswered,
		};
	}

	public withId(id: string | null): this {
		this.props.id = id;
		return this;
	}

	public withQuizzId(quizzId: string): this {
		this.props.quizzId = quizzId;
		return this;
	}

	public withPlayerId(playerId: string): this {
		this.props.playerId = playerId;
		return this;
	}

	public withStartedAt(startedAt: Date): this {
		this.props.startedAt = startedAt;
		if (this.props.completedAt && this.props.completedAt < startedAt) {
			this.props.completedAt = faker.date.between({ from: startedAt, to: new Date() });
		}
		return this;
	}

	public withCompletedAt(completedAt: Date | null): this {
		this.props.completedAt = completedAt;
		if (completedAt && this.props.startedAt && completedAt < this.props.startedAt) {
			this.props.startedAt = faker.date.recent({ refDate: completedAt });
		}
		return this;
	}

	public withScore(score: number): this {
		this.props.score = score;
		if (this.props.totalQuestionsAnswered !== undefined && score > this.props.totalQuestionsAnswered) {
			this.props.totalQuestionsAnswered = score;
		}
		return this;
	}

	public withTotalQuestionsAnswered(totalQuestionsAnswered: number): this {
		this.props.totalQuestionsAnswered = totalQuestionsAnswered;
		if (this.props.score !== undefined && this.props.score > totalQuestionsAnswered) {
			this.props.score = totalQuestionsAnswered;
		}
		return this;
	}

	public build(): Attempt {
		const startDate = this.props.startedAt ?? faker.date.recent({ days: 7 });
		const totalQuestionsAnswered = this.props.totalQuestionsAnswered ?? faker.number.int({ min: 5, max: 20 });
		const score = this.props.score ?? faker.number.int({ min: 0, max: totalQuestionsAnswered });
		const isCompleted =
			this.props.completedAt !== undefined ? this.props.completedAt !== null : faker.datatype.boolean();
		const completedAt =
			this.props.completedAt === undefined
				? isCompleted
					? faker.date.between({ from: startDate, to: new Date() })
					: null
				: this.props.completedAt;

		const finalProps: AttemptProps = {
			id: this.props.id ?? faker.string.uuid(),
			quizzId: this.props.quizzId ?? faker.string.uuid(),
			playerId: this.props.playerId ?? faker.string.uuid(),
			startedAt: startDate,
			completedAt: completedAt,
			score: score,
			totalQuestionsAnswered: totalQuestionsAnswered,
		};
		return Attempt.create(finalProps);
	}
}
