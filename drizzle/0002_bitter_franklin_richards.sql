ALTER TABLE "quizz_webapp_quizz_attempt" RENAME TO "quizz_webapp_attempt";--> statement-breakpoint
ALTER TABLE "quizz_webapp_player_response" RENAME TO "quizz_webapp_response";--> statement-breakpoint
ALTER TABLE "quizz_webapp_response" DROP CONSTRAINT "quizz_webapp_player_response_attempt_id_quizz_webapp_quizz_attempt_id_fk";
--> statement-breakpoint
ALTER TABLE "quizz_webapp_response" DROP CONSTRAINT "quizz_webapp_player_response_question_id_quizz_webapp_question_id_fk";
--> statement-breakpoint
ALTER TABLE "quizz_webapp_response" DROP CONSTRAINT "quizz_webapp_player_response_answer_id_quizz_webapp_answer_id_fk";
--> statement-breakpoint
ALTER TABLE "quizz_webapp_attempt" DROP CONSTRAINT "quizz_webapp_quizz_attempt_quizz_id_quizz_webapp_quizz_id_fk";
--> statement-breakpoint
ALTER TABLE "quizz_webapp_attempt" DROP CONSTRAINT "quizz_webapp_quizz_attempt_player_id_quizz_webapp_player_id_fk";
--> statement-breakpoint
DROP INDEX "player_response_attempt_idx";--> statement-breakpoint
DROP INDEX "player_response_question_idx";--> statement-breakpoint
DROP INDEX "player_response_attempt_question_idx";--> statement-breakpoint
DROP INDEX "quizz_attempt_quizz_idx";--> statement-breakpoint
DROP INDEX "quizz_attempt_player_idx";--> statement-breakpoint
DROP INDEX "quizz_attempt_completed_idx";--> statement-breakpoint
ALTER TABLE "quizz_webapp_response" ADD CONSTRAINT "quizz_webapp_response_attempt_id_quizz_webapp_attempt_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."quizz_webapp_attempt"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizz_webapp_response" ADD CONSTRAINT "quizz_webapp_response_question_id_quizz_webapp_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."quizz_webapp_question"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizz_webapp_response" ADD CONSTRAINT "quizz_webapp_response_answer_id_quizz_webapp_answer_id_fk" FOREIGN KEY ("answer_id") REFERENCES "public"."quizz_webapp_answer"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizz_webapp_attempt" ADD CONSTRAINT "quizz_webapp_attempt_quizz_id_quizz_webapp_quizz_id_fk" FOREIGN KEY ("quizz_id") REFERENCES "public"."quizz_webapp_quizz"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizz_webapp_attempt" ADD CONSTRAINT "quizz_webapp_attempt_player_id_quizz_webapp_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."quizz_webapp_player"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "response_attempt_idx" ON "quizz_webapp_response" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "response_question_idx" ON "quizz_webapp_response" USING btree ("question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "response_attempt_question_idx" ON "quizz_webapp_response" USING btree ("attempt_id","question_id");--> statement-breakpoint
CREATE INDEX "attempt_quizz_idx" ON "quizz_webapp_attempt" USING btree ("quizz_id");--> statement-breakpoint
CREATE INDEX "attempt_player_idx" ON "quizz_webapp_attempt" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "attempt_completed_idx" ON "quizz_webapp_attempt" USING btree ("completed_at");