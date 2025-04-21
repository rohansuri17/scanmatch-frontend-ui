-- Drop the modified tables
DROP TABLE IF EXISTS interview_qa CASCADE;
DROP TABLE IF EXISTS resume_analyses CASCADE;

-- Recreate resume_analyses with original schema
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

-- Recreate interview_qa with original schema
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