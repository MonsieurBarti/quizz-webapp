import { faker } from '@faker-js/faker';
import { Player, PlayerProps } from './player';

export class PlayerBuilder {
	private props: Partial<PlayerProps>;

	constructor() {
		this.props = {
			id: faker.string.uuid(),
			email: faker.internet.email(),
			name: faker.person.fullName(),
		};
	}

	public withId(id: string | null): this {
		this.props.id = id;
		return this;
	}

	public withEmail(email: string): this {
		this.props.email = email;
		return this;
	}

	public withName(name: string | null): this {
		this.props.name = name;
		return this;
	}

	public build(): Player {
		const finalProps: PlayerProps = {
			id: this.props.id ?? faker.string.uuid(),
			email: this.props.email ?? faker.internet.email(),
			name: this.props.name ?? faker.person.fullName(),
		};
		return Player.create(finalProps);
	}
}
