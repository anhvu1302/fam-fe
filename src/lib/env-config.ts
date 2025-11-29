import { z } from "zod";

const envSchema = z.object({
    // Port for development server
    PORT: z.coerce.number().optional().default(3000),

    // Backend API URL (Server-side only)
    BACKEND_API_URL: z.string().url().optional(),

    // Crypto key for payload encryption
    NEXT_PUBLIC_CRYPTO_KEY: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

function parseEnv(): EnvConfig {
    const parsed = envSchema.safeParse({
        PORT: process.env.PORT,
        BACKEND_API_URL: process.env.BACKEND_API_URL,
        NEXT_PUBLIC_CRYPTO_KEY: process.env.NEXT_PUBLIC_CRYPTO_KEY,
    });

    if (!parsed.success) {
        console.error(
            "❌ Invalid environment variables:",
            parsed.error.flatten().fieldErrors
        );
        throw new Error("Invalid environment variables");
    }

    return parsed.data;
}

export const envConfig = parseEnv();
