import { relations, sql } from 'drizzle-orm';
import { index, pgTableCreator, primaryKey, uniqueIndex } from 'drizzle-orm/pg-core';
import { type AdapterAccount } from '@auth/core/adapters';

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator(name => `quizz_webapp_${name}`);

export const player = createTable(
	'player',
	t => ({
		id: t.uuid().notNull().primaryKey().defaultRandom(),
		email: t.varchar({ length: 256 }).notNull(),
		name: t.varchar({ length: 256 }),
		createdAt: t
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: t
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	}),
	t => [uniqueIndex('player_email_idx').on(t.email)],
);
export const playerRelations = relations(player, ({ many }) => ({
	attempts: many(attempt),
}));

export const quizz = createTable(
	'quizz',
	t => ({
		id: t.uuid().notNull().primaryKey().defaultRandom(),
		title: t.varchar({ length: 256 }).notNull(),
		description: t.text(),
		createdBy: t
			.uuid()
			.notNull()
			.references(() => users.id),
		isPublished: t.boolean().default(false).notNull(),
		createdAt: t
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: t
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	}),
	t => [index('quizz_created_by_idx').on(t.createdBy), index('quizz_published_idx').on(t.isPublished)],
);
export const quizzRelations = relations(quizz, ({ one, many }) => ({
	createdBy: one(users, {
		fields: [quizz.createdBy],
		references: [users.id],
	}),
	questions: many(question),
	attempts: many(attempt),
}));

export const question = createTable(
	'question',
	t => ({
		id: t.uuid().notNull().primaryKey().defaultRandom(),
		quizzId: t
			.uuid()
			.notNull()
			.references(() => quizz.id, { onDelete: 'cascade' }),
		text: t.text().notNull(),
		order: t.integer().notNull(), // Order within the quizz
		imageUrl: t.text(),
		createdAt: t
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: t
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	}),
	t => [
		index('question_quizz_idx').on(t.quizzId),
		index('question_order_idx').on(t.quizzId, t.order),
		uniqueIndex('question_quizz_order_idx').on(t.quizzId, t.order),
	],
);
export const questionRelations = relations(question, ({ one, many }) => ({
	quizz: one(quizz, { fields: [question.quizzId], references: [quizz.id] }),
	answers: many(answer),
	responses: many(response),
}));

export const answer = createTable(
	'answer',
	t => ({
		id: t.uuid().notNull().primaryKey().defaultRandom(),
		questionId: t
			.uuid()
			.notNull()
			.references(() => question.id, { onDelete: 'cascade' }),
		text: t.text().notNull(),
		isCorrect: t.boolean().default(false).notNull(),
		order: t.integer().notNull(), // Order within the question
		nextQuestionId: t.uuid().references(() => question.id, { onDelete: 'set null' }), // For branching logic
		createdAt: t
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: t
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	}),
	t => [
		index('answer_question_idx').on(t.questionId),
		index('answer_order_idx').on(t.questionId, t.order),
		uniqueIndex('answer_question_order_idx').on(t.questionId, t.order),
		index('answer_next_question_idx').on(t.nextQuestionId), // Index for the new field
	],
);
export const answerRelations = relations(answer, ({ one, many }) => ({
	question: one(question, {
		fields: [answer.questionId],
		references: [question.id],
	}),
	nextQuestion: one(question, {
		// Relation for branching
		fields: [answer.nextQuestionId],
		references: [question.id],
		relationName: 'nextQuestionForAnswer', // Explicit relation name to avoid conflict if question has multiple relations to answer
	}),
	responses: many(response),
}));

export const attempt = createTable(
	'attempt',
	t => ({
		id: t.uuid().notNull().primaryKey().defaultRandom(),
		quizzId: t
			.uuid()
			.notNull()
			.references(() => quizz.id, { onDelete: 'cascade' }),
		playerId: t
			.uuid()
			.notNull()
			.references(() => player.id),
		startedAt: t
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		completedAt: t.timestamp({ withTimezone: true }),
		score: t.integer().default(0).notNull(),
		totalQuestionsAnswered: t.integer().default(0).notNull(),
	}),
	t => [
		uniqueIndex('attempt_player_quizz_idx').on(t.playerId, t.quizzId),
		index('attempt_quizz_idx').on(t.quizzId),
		index('attempt_player_idx').on(t.playerId),
		index('attempt_completed_idx').on(t.completedAt),
	],
);
export const attemptRelations = relations(attempt, ({ one, many }) => ({
	quizz: one(quizz, {
		fields: [attempt.quizzId],
		references: [quizz.id],
	}),
	player: one(player, {
		fields: [attempt.playerId],
		references: [player.id],
	}),
	responses: many(response),
}));

export const response = createTable(
	'response',
	t => ({
		id: t.uuid().notNull().primaryKey().defaultRandom(),
		attemptId: t
			.uuid()
			.notNull()
			.references(() => attempt.id, { onDelete: 'cascade' }),
		questionId: t
			.uuid()
			.notNull()
			.references(() => question.id),
		answerId: t
			.uuid()
			.notNull()
			.references(() => answer.id),
		isCorrect: t.boolean().notNull(),
		timeTakenMs: t.integer().notNull(), // Time taken to answer in milliseconds
		respondedAt: t
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	}),
	t => [
		index('response_attempt_idx').on(t.attemptId),
		index('response_question_idx').on(t.questionId),
		uniqueIndex('response_attempt_question_idx').on(t.attemptId, t.questionId),
	],
);
export const responseRelations = relations(response, ({ one }) => ({
	attempt: one(attempt, {
		fields: [response.attemptId],
		references: [attempt.id],
	}),
	question: one(question, {
		fields: [response.questionId],
		references: [question.id],
	}),
	answer: one(answer, {
		fields: [response.answerId],
		references: [answer.id],
	}),
}));

export const users = createTable('users', t => ({
	id: t
		.uuid()
		.notNull()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: t.varchar({ length: 255 }),
	email: t.varchar({ length: 255 }).notNull(),
	emailVerified: t
		.timestamp({
			mode: 'date',
			withTimezone: true,
		})
		.default(sql`CURRENT_TIMESTAMP`),
	image: t.varchar({ length: 255 }),
	createdAt: t
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: t
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
}));
export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
	quizzes: many(quizz),
}));

export const accounts = createTable(
	'account',
	t => ({
		userId: t
			.uuid()
			.notNull()
			.references(() => users.id),
		type: t.varchar({ length: 255 }).$type<AdapterAccount['type']>().notNull(),
		provider: t.varchar({ length: 255 }).notNull(),
		providerAccountId: t.varchar({ length: 255 }).notNull(),
		refresh_token: t.text(),
		access_token: t.text(),
		expires_at: t.integer(),
		token_type: t.varchar({ length: 255 }),
		scope: t.varchar({ length: 255 }),
		id_token: t.text(),
		session_state: t.varchar({ length: 255 }),
	}),
	t => [primaryKey({ columns: [t.provider, t.providerAccountId] }), index('account_user_id_idx').on(t.userId)],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
	users: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
	'session',
	t => ({
		sessionToken: t.varchar({ length: 255 }).notNull().primaryKey(),
		userId: t
			.uuid()
			.notNull()
			.references(() => users.id),
		expires: t.timestamp({ mode: 'date', withTimezone: true }).notNull(),
	}),
	t => [index('session_user_id_idx').on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
	users: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
	'verification_token',
	t => ({
		identifier: t.varchar({ length: 255 }).notNull(),
		token: t.varchar({ length: 255 }).notNull(),
		expires: t.timestamp({ mode: 'date', withTimezone: true }).notNull(),
	}),
	t => [primaryKey({ columns: [t.identifier, t.token] })],
);
