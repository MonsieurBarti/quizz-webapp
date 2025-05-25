CREATE TABLE "quizz_webapp_account" (
	"user_id" uuid NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "quizz_webapp_account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "quizz_webapp_answer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"text" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"order" integer NOT NULL,
	"next_question_id" uuid,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quizz_webapp_question" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quiz_id" uuid NOT NULL,
	"text" text NOT NULL,
	"order" integer NOT NULL,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quizz_webapp_quizz" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(256) NOT NULL,
	"description" text,
	"created_by" uuid NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quizz_webapp_quizz_attempt" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quizz_id" uuid NOT NULL,
	"quizz_taker_id" uuid NOT NULL,
	"started_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"completed_at" timestamp with time zone,
	"score" integer,
	"total_questions" integer
);
--> statement-breakpoint
CREATE TABLE "quizz_webapp_quizz_taker" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(256) NOT NULL,
	"name" varchar(256),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quizz_webapp_quizz_taker_response" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"answer_id" uuid NOT NULL,
	"is_correct" boolean NOT NULL,
	"time_taken_ms" integer,
	"responded_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quizz_webapp_session" (
	"session_token" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quizz_webapp_users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"image" varchar(255),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quizz_webapp_verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "quizz_webapp_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "quizz_webapp_account" ADD CONSTRAINT "quizz_webapp_account_user_id_quizz_webapp_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."quizz_webapp_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizz_webapp_answer" ADD CONSTRAINT "quizz_webapp_answer_question_id_quizz_webapp_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."quizz_webapp_question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizz_webapp_answer" ADD CONSTRAINT "quizz_webapp_answer_next_question_id_quizz_webapp_question_id_fk" FOREIGN KEY ("next_question_id") REFERENCES "public"."quizz_webapp_question"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizz_webapp_question" ADD CONSTRAINT "quizz_webapp_question_quiz_id_quizz_webapp_quizz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizz_webapp_quizz"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizz_webapp_quizz" ADD CONSTRAINT "quizz_webapp_quizz_created_by_quizz_webapp_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."quizz_webapp_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizz_webapp_quizz_attempt" ADD CONSTRAINT "quizz_webapp_quizz_attempt_quizz_id_quizz_webapp_quizz_id_fk" FOREIGN KEY ("quizz_id") REFERENCES "public"."quizz_webapp_quizz"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizz_webapp_quizz_attempt" ADD CONSTRAINT "quizz_webapp_quizz_attempt_quizz_taker_id_quizz_webapp_quizz_taker_id_fk" FOREIGN KEY ("quizz_taker_id") REFERENCES "public"."quizz_webapp_quizz_taker"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizz_webapp_quizz_taker_response" ADD CONSTRAINT "quizz_webapp_quizz_taker_response_attempt_id_quizz_webapp_quizz_attempt_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."quizz_webapp_quizz_attempt"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizz_webapp_quizz_taker_response" ADD CONSTRAINT "quizz_webapp_quizz_taker_response_question_id_quizz_webapp_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."quizz_webapp_question"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizz_webapp_quizz_taker_response" ADD CONSTRAINT "quizz_webapp_quizz_taker_response_answer_id_quizz_webapp_answer_id_fk" FOREIGN KEY ("answer_id") REFERENCES "public"."quizz_webapp_answer"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizz_webapp_session" ADD CONSTRAINT "quizz_webapp_session_user_id_quizz_webapp_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."quizz_webapp_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "quizz_webapp_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "answer_question_idx" ON "quizz_webapp_answer" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "answer_order_idx" ON "quizz_webapp_answer" USING btree ("question_id","order");--> statement-breakpoint
CREATE UNIQUE INDEX "answer_question_order_idx" ON "quizz_webapp_answer" USING btree ("question_id","order");--> statement-breakpoint
CREATE INDEX "answer_next_question_idx" ON "quizz_webapp_answer" USING btree ("next_question_id");--> statement-breakpoint
CREATE INDEX "question_quiz_idx" ON "quizz_webapp_question" USING btree ("quiz_id");--> statement-breakpoint
CREATE INDEX "question_order_idx" ON "quizz_webapp_question" USING btree ("quiz_id","order");--> statement-breakpoint
CREATE UNIQUE INDEX "question_quiz_order_idx" ON "quizz_webapp_question" USING btree ("quiz_id","order");--> statement-breakpoint
CREATE INDEX "quizz_created_by_idx" ON "quizz_webapp_quizz" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "quizz_published_idx" ON "quizz_webapp_quizz" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "quizz_attempt_quizz_idx" ON "quizz_webapp_quizz_attempt" USING btree ("quizz_id");--> statement-breakpoint
CREATE INDEX "quizz_attempt_taker_idx" ON "quizz_webapp_quizz_attempt" USING btree ("quizz_taker_id");--> statement-breakpoint
CREATE INDEX "quizz_attempt_completed_idx" ON "quizz_webapp_quizz_attempt" USING btree ("completed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "quizz_taker_email_idx" ON "quizz_webapp_quizz_taker" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_response_attempt_idx" ON "quizz_webapp_quizz_taker_response" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "user_response_question_idx" ON "quizz_webapp_quizz_taker_response" USING btree ("question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_response_attempt_question_idx" ON "quizz_webapp_quizz_taker_response" USING btree ("attempt_id","question_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "quizz_webapp_session" USING btree ("user_id");