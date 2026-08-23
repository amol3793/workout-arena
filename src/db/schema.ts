import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

/* ============ Community (existing) ============ */

export const feedbackSubmissions = pgTable(
  "feedback_submissions",
  {
    id: serial("id").primaryKey(),
    type: varchar("type", { length: 24 }).notNull().default("suggestion"),
    name: varchar("name", { length: 120 }),
    email: varchar("email", { length: 320 }),
    message: text("message").notNull(),
    pagePath: varchar("page_path", { length: 500 }),
    status: varchar("status", { length: 24 }).notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("feedback_status_idx").on(table.status),
    index("feedback_created_at_idx").on(table.createdAt),
  ],
);

export const marketingSubscribers = pgTable(
  "marketing_subscribers",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 320 }).notNull(),
    consent: boolean("consent").notNull().default(false),
    consentText: text("consent_text").notNull(),
    source: varchar("source", { length: 120 }).notNull().default("contact-page"),
    status: varchar("status", { length: 24 }).notNull().default("subscribed"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("marketing_subscribers_email_uidx").on(table.email),
    index("marketing_subscribers_status_idx").on(table.status),
  ],
);

/* ============ User Authentication ============ */

/**
 * Simple email-based user accounts. No password — uses a session token stored
 * in localStorage. The Explore experience remains fully public; login is only
 * required for AI workout planning and progress tracking.
 */
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 320 }).notNull(),
    name: varchar("name", { length: 120 }),
    sessionToken: varchar("session_token", { length: 128 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("users_email_uidx").on(table.email)],
);

/* ============ AI Fitness Layer ============ */

/**
 * User fitness profile — goals, experience, equipment.
 * Uses visitorId which can be a localStorage UUID or a user session token.
 */
export const userProfiles = pgTable(
  "user_profiles",
  {
    id: serial("id").primaryKey(),
    visitorId: varchar("visitor_id", { length: 64 }).notNull(),
    goal: varchar("goal", { length: 32 }).notNull().default("general-fitness"),
    experience: varchar("experience", { length: 24 }).notNull().default("beginner"),
    trainingDays: integer("training_days").notNull().default(3),
    workoutDuration: integer("workout_duration_min").notNull().default(45),
    equipment: jsonb("equipment").$type<string[]>().notNull().default([]),
    trainingStyle: varchar("training_style", { length: 48 }),
    musclePriorities: jsonb("muscle_priorities").$type<string[]>().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("user_profiles_visitor_uidx").on(table.visitorId)],
);

/**
 * AI-generated workout plan — the weekly schedule.
 * `planData` is the full structured JSON (days → exercises → sets/reps/rest).
 */
export const workoutPlans = pgTable(
  "workout_plans",
  {
    id: serial("id").primaryKey(),
    visitorId: varchar("visitor_id", { length: 64 }).notNull(),
    name: varchar("name", { length: 120 }).notNull().default("My Plan"),
    planData: jsonb("plan_data").$type<WorkoutPlanData>().notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("workout_plans_visitor_idx").on(table.visitorId)],
);

/** Individual logged workout session. */
export const workoutSessions = pgTable(
  "workout_sessions",
  {
    id: serial("id").primaryKey(),
    visitorId: varchar("visitor_id", { length: 64 }).notNull(),
    planId: integer("plan_id"),
    dayLabel: varchar("day_label", { length: 64 }),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    notes: text("notes"),
  },
  (table) => [
    index("workout_sessions_visitor_idx").on(table.visitorId),
    index("workout_sessions_started_idx").on(table.startedAt),
  ],
);

/** Individual set logged within a session. */
export const workoutSets = pgTable(
  "workout_sets",
  {
    id: serial("id").primaryKey(),
    sessionId: integer("session_id").notNull(),
    exerciseId: varchar("exercise_id", { length: 120 }).notNull(),
    setNumber: integer("set_number").notNull().default(1),
    weight: real("weight"), // kg
    reps: integer("reps"),
    completed: boolean("completed").notNull().default(true),
    rpe: real("rpe"), // optional perceived exertion 1-10
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("workout_sets_session_idx").on(table.sessionId),
    index("workout_sets_exercise_idx").on(table.exerciseId),
  ],
);

/** AI-generated recommendations stored for reference/display. */
export const aiRecommendations = pgTable(
  "ai_recommendations",
  {
    id: serial("id").primaryKey(),
    visitorId: varchar("visitor_id", { length: 64 }).notNull(),
    type: varchar("type", { length: 32 }).notNull(), // exercise, progression, adaptation, insight
    exerciseId: varchar("exercise_id", { length: 120 }),
    content: text("content").notNull(),
    reasoning: text("reasoning"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("ai_recommendations_visitor_idx").on(table.visitorId)],
);

/* ============ TypeScript types for plan JSON ============ */

export interface PlannedExercise {
  exerciseId: string;
  name: string;
  targetMuscle: string;
  sets: number;
  reps: string; // e.g. "8-12" or "10"
  restSeconds: number;
  suggestedWeight?: string;
  notes?: string;
}

export interface WorkoutDay {
  dayLabel: string; // e.g. "Monday — Push"
  focus: string;
  warmup?: string;
  exercises: PlannedExercise[];
  estimatedMinutes: number;
}

export interface WorkoutPlanData {
  weeklySchedule: WorkoutDay[];
  aiNotes?: string;
}
