

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."interview_question_type" AS ENUM (
    'technical',
    'behavioral',
    'resume_based'
);


ALTER TYPE "public"."interview_question_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."clean_expired_learning_path_cache"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  DELETE FROM learning_path_cache WHERE expires_at < NOW();
END;
$$;


ALTER FUNCTION "public"."clean_expired_learning_path_cache"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_clean_expired_learning_path_cache"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  PERFORM clean_expired_learning_path_cache();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_clean_expired_learning_path_cache"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."interview_practice_sessions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "is_public" boolean DEFAULT false
);


ALTER TABLE "public"."interview_practice_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."interview_qa" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "session_id" "uuid",
    "question_type" "public"."interview_question_type" NOT NULL,
    "question" "text" NOT NULL,
    "context" "text",
    "user_answer" "text",
    "ai_feedback" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."interview_qa" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."learning_path_cache" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cache_key" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "learning_path" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "expires_at" timestamp with time zone NOT NULL
);


ALTER TABLE "public"."learning_path_cache" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resume_analyses" (
    "id" "text" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "text",
    "score" "text",
    "keywords_found" "text",
    "keywords_missing" "text",
    "structure_strengths" "text",
    "structure_improvements" "text",
    "job_title" "text",
    "created_at" "text",
    "improvement_suggestions" "text",
    "interview_questions" "jsonb"
);


ALTER TABLE "public"."resume_analyses" OWNER TO "postgres";


COMMENT ON COLUMN "public"."resume_analyses"."interview_questions" IS 'Stores interview questions generated from resume analysis, including technical, behavioral, and resume-based questions with context';



CREATE TABLE IF NOT EXISTS "public"."resume_scan_data" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "resume_text" "text" NOT NULL,
    "job_description" "text" NOT NULL,
    "job_title" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."resume_scan_data" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_subscriptions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "stripe_customer_id" "text",
    "subscription_tier" "text" DEFAULT 'free'::"text",
    "subscription_id" "text",
    "subscription_status" "text",
    "subscription_period_end" timestamp with time zone,
    "scans_used" integer DEFAULT 0,
    "max_scans" integer DEFAULT 5,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_subscriptions_subscription_tier_check" CHECK (("subscription_tier" = ANY (ARRAY['free'::"text", 'pro'::"text", 'premium'::"text"])))
);


ALTER TABLE "public"."user_subscriptions" OWNER TO "postgres";


ALTER TABLE ONLY "public"."interview_practice_sessions"
    ADD CONSTRAINT "interview_practice_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interview_qa"
    ADD CONSTRAINT "interview_qa_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."learning_path_cache"
    ADD CONSTRAINT "learning_path_cache_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resume_analyses"
    ADD CONSTRAINT "resume_analyses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resume_scan_data"
    ADD CONSTRAINT "resume_scan_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."learning_path_cache"
    ADD CONSTRAINT "unique_cache_key" UNIQUE ("cache_key");



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_interview_practice_sessions_user_id" ON "public"."interview_practice_sessions" USING "btree" ("user_id");



CREATE INDEX "idx_interview_qa_session_id" ON "public"."interview_qa" USING "btree" ("session_id");



CREATE INDEX "idx_learning_path_cache_expires_at" ON "public"."learning_path_cache" USING "btree" ("expires_at");



CREATE INDEX "idx_learning_path_cache_user_id" ON "public"."learning_path_cache" USING "btree" ("user_id");



CREATE INDEX "idx_resume_scan_data_created_at" ON "public"."resume_scan_data" USING "btree" ("created_at");



CREATE INDEX "idx_resume_scan_data_user_id" ON "public"."resume_scan_data" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "clean_expired_learning_path_cache_trigger" AFTER INSERT ON "public"."learning_path_cache" FOR EACH STATEMENT EXECUTE FUNCTION "public"."trigger_clean_expired_learning_path_cache"();



ALTER TABLE ONLY "public"."interview_practice_sessions"
    ADD CONSTRAINT "interview_practice_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_qa"
    ADD CONSTRAINT "interview_qa_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."interview_practice_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."learning_path_cache"
    ADD CONSTRAINT "learning_path_cache_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."resume_scan_data"
    ADD CONSTRAINT "resume_scan_data_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Only service role can modify cache" ON "public"."learning_path_cache" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Users can create Q&A" ON "public"."interview_qa" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."interview_practice_sessions"
  WHERE (("interview_practice_sessions"."id" = "interview_qa"."session_id") AND ("interview_practice_sessions"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can create practice sessions" ON "public"."interview_practice_sessions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own Q&A" ON "public"."interview_qa" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."interview_practice_sessions"
  WHERE (("interview_practice_sessions"."id" = "interview_qa"."session_id") AND ("interview_practice_sessions"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can delete their own practice sessions" ON "public"."interview_practice_sessions" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own scan data" ON "public"."resume_scan_data" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own analyses" ON "public"."resume_analyses" FOR INSERT WITH CHECK ((("auth"."uid"())::"text" = "user_id"));



CREATE POLICY "Users can insert their own scan data" ON "public"."resume_scan_data" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read their own analyses" ON "public"."resume_analyses" FOR SELECT USING ((("auth"."uid"())::"text" = "user_id"));



CREATE POLICY "Users can read their own cached results" ON "public"."learning_path_cache" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read their own scan data" ON "public"."resume_scan_data" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own Q&A" ON "public"."interview_qa" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."interview_practice_sessions"
  WHERE (("interview_practice_sessions"."id" = "interview_qa"."session_id") AND ("interview_practice_sessions"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update their own practice sessions" ON "public"."interview_practice_sessions" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own scan count" ON "public"."user_subscriptions" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own scan data" ON "public"."resume_scan_data" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own subscription" ON "public"."user_subscriptions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own Q&A" ON "public"."interview_qa" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."interview_practice_sessions"
  WHERE (("interview_practice_sessions"."id" = "interview_qa"."session_id") AND ("interview_practice_sessions"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own practice sessions" ON "public"."interview_practice_sessions" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."interview_practice_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."interview_qa" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."learning_path_cache" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."resume_analyses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."resume_scan_data" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_subscriptions" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."clean_expired_learning_path_cache"() TO "anon";
GRANT ALL ON FUNCTION "public"."clean_expired_learning_path_cache"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."clean_expired_learning_path_cache"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_clean_expired_learning_path_cache"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_clean_expired_learning_path_cache"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_clean_expired_learning_path_cache"() TO "service_role";


















GRANT ALL ON TABLE "public"."interview_practice_sessions" TO "anon";
GRANT ALL ON TABLE "public"."interview_practice_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."interview_practice_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."interview_qa" TO "anon";
GRANT ALL ON TABLE "public"."interview_qa" TO "authenticated";
GRANT ALL ON TABLE "public"."interview_qa" TO "service_role";



GRANT ALL ON TABLE "public"."learning_path_cache" TO "anon";
GRANT ALL ON TABLE "public"."learning_path_cache" TO "authenticated";
GRANT ALL ON TABLE "public"."learning_path_cache" TO "service_role";



GRANT ALL ON TABLE "public"."resume_analyses" TO "anon";
GRANT ALL ON TABLE "public"."resume_analyses" TO "authenticated";
GRANT ALL ON TABLE "public"."resume_analyses" TO "service_role";



GRANT ALL ON TABLE "public"."resume_scan_data" TO "anon";
GRANT ALL ON TABLE "public"."resume_scan_data" TO "authenticated";
GRANT ALL ON TABLE "public"."resume_scan_data" TO "service_role";



GRANT ALL ON TABLE "public"."user_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."user_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_subscriptions" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
