ALTER TABLE "quizz_webapp_question" RENAME COLUMN "quiz_id" TO "quizz_id";--> statement-breakpoint
ALTER TABLE "quizz_webapp_question" DROP CONSTRAINT "quizz_webapp_question_quiz_id_quizz_webapp_quizz_id_fk";
--> statement-breakpoint
DROP INDEX "question_quiz_idx";--> statement-breakpoint
DROP INDEX "question_quiz_order_idx";--> statement-breakpoint
DROP INDEX "question_order_idx";--> statement-breakpoint
ALTER TABLE "quizz_webapp_response" ALTER COLUMN "time_taken_ms" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "quizz_webapp_question" ADD CONSTRAINT "quizz_webapp_question_quizz_id_quizz_webapp_quizz_id_fk" FOREIGN KEY ("quizz_id") REFERENCES "public"."quizz_webapp_quizz"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "question_quizz_idx" ON "quizz_webapp_question" USING btree ("quizz_id");--> statement-breakpoint
CREATE UNIQUE INDEX "question_quizz_order_idx" ON "quizz_webapp_question" USING btree ("quizz_id","order");--> statement-breakpoint
CREATE INDEX "question_order_idx" ON "quizz_webapp_question" USING btree ("quizz_id","order");