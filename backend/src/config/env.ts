import "dotenv/config";
import {z} from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().int().max(65535).min(1).default(4000),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    DIRECT_URL: z.string().min(1, "DIRECT_URL is required"),

    SUPABASE_URL: z.url("SUPABASE_URL must be a valid URL"),
    SUPABASE_PUBLISHABLE_KEY: z.string().min(1, "SUPABASE_PUBLISHABLE_KEY is required"),

    FRONTEND_URL: z.url("FRONTEND_URL must be a valid URL").default("http://localhost:5173"),
});

const result = envSchema.safeParse(process.env);
if(!result.success) {
    console.error("Invalid environment configuration");

    for(const issue of result.error.issues) {
        console.error(`-${issue.path.join(".")}: ${issue.message}`);
    }

    throw new Error("Environment validation failed");
}

const env = result.data;

export default env;