ALTER TABLE "quizz_webapp_attempt" RENAME COLUMN "total_questions" TO "total_questions_answered";--> statement-breakpoint
ALTER TABLE "quizz_webapp_attempt" ALTER COLUMN "score" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "quizz_webapp_attempt" ALTER COLUMN "score" SET NOT NULL;