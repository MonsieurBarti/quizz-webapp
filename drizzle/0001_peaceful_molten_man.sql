ALTER TABLE "quizz_webapp_quizz_taker" RENAME TO "quizz_webapp_player";--> statement-breakpoint
ALTER TABLE "quizz_webapp_quizz_taker_response" RENAME TO "quizz_webapp_player_response";--> statement-breakpoint
ALTER TABLE "quizz_webapp_quizz_attempt" RENAME COLUMN "quizz_taker_id" TO "player_id";--> statement-breakpoint
ALTER TABLE "quizz_webapp_quizz_attempt" DROP CONSTRAINT "quizz_webapp_quizz_attempt_quizz_taker_id_quizz_webapp_quizz_taker_id_fk";
--> statement-breakpoint
ALTER TABLE "quizz_webapp_player_response" DROP CONSTRAINT "quizz_webapp_quizz_taker_response_attempt_id_quizz_webapp_quizz_attempt_id_fk";
--> statement-breakpoint
ALTER TABLE "quizz_webapp_player_response" DROP CONSTRAINT "quizz_webapp_quizz_taker_response_question_id_quizz_webapp_question_id_fk";
--> statement-breakpoint
ALTER TABLE "quizz_webapp_player_response" DROP CONSTRAINT "quizz_webapp_quizz_taker_response_answer_id_quizz_webapp_answer_id_fk";
--> statement-breakpoint
DROP INDEX "quizz_attempt_taker_idx";--> statement-breakpoint
DROP INDEX "quizz_taker_email_idx";--> statement-breakpoint
DROP INDEX "user_response_attempt_idx";--> statement-breakpoint
DROP INDEX "user_response_question_idx";--> statement-breakpoint
DROP INDEX "user_response_attempt_question_idx";--> statement-breakpoint
ALTER TABLE "quizz_webapp_quizz_attempt" ADD CONSTRAINT "quizz_webapp_quizz_attempt_player_id_quizz_webapp_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."quizz_webapp_player"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizz_webapp_player_response" ADD CONSTRAINT "quizz_webapp_player_response_attempt_id_quizz_webapp_quizz_attempt_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."quizz_webapp_quizz_attempt"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizz_webapp_player_response" ADD CONSTRAINT "quizz_webapp_player_response_question_id_quizz_webapp_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."quizz_webapp_question"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizz_webapp_player_response" ADD CONSTRAINT "quizz_webapp_player_response_answer_id_quizz_webapp_answer_id_fk" FOREIGN KEY ("answer_id") REFERENCES "public"."quizz_webapp_answer"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "quizz_attempt_player_idx" ON "quizz_webapp_quizz_attempt" USING btree ("player_id");--> statement-breakpoint
CREATE UNIQUE INDEX "player_email_idx" ON "quizz_webapp_player" USING btree ("email");--> statement-breakpoint
CREATE INDEX "player_response_attempt_idx" ON "quizz_webapp_player_response" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "player_response_question_idx" ON "quizz_webapp_player_response" USING btree ("question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "player_response_attempt_question_idx" ON "quizz_webapp_player_response" USING btree ("attempt_id","question_id");