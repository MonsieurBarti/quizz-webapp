import { Response, ResponseProps } from '@/server/modules/quizz-taker/domain/response/response';
import { response } from '@/server/db/schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type ResponseSchemaSelect = InferSelectModel<typeof response>;
export type ResponseSchemaInsert = InferInsertModel<typeof response>;

export class ResponseMapper {
	/**
	 * Converts a Drizzle response record (select model) to a Response domain entity.
	 * @param raw - The raw response data from the database.
	 * @returns A Response domain entity.
	 */
	static toDomain(raw: ResponseSchemaSelect): Response {
		const ResponseProps: ResponseProps = {
			id: raw.id,
			attemptId: raw.attemptId,
			questionId: raw.questionId,
			answerId: raw.answerId,
			isCorrect: raw.isCorrect,
			timeTakenMs: raw.timeTakenMs,
		};
		return Response.create(ResponseProps);
	}

	/**
	 * Converts a Response domain entity to a Drizzle response record (insert model).
	 * @param domainResponse - The Response domain entity to convert.
	 * @returns A Drizzle response record (insert model).
	 */
	static toPersistence(domainResponse: Response): ResponseSchemaInsert {
		const persistenceRecord: ResponseSchemaInsert = {
			id: domainResponse.id,
			attemptId: domainResponse.attemptId,
			questionId: domainResponse.questionId,
			answerId: domainResponse.answerId,
			isCorrect: domainResponse.isCorrect,
			timeTakenMs: domainResponse.timeTakenMs,
		};
		return persistenceRecord;
	}
}
