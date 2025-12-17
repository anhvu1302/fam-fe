/**
 * OpenAPI TypeScript Generator Configuration
 * 
 * This config is used to generate TypeScript types from OpenAPI/Swagger specification
 */

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

export interface OpenapiConfig {
    /** Swagger/OpenAPI JSON URL */
    swaggerUrl: string;
    /** Output path for generated types */
    outputPath: string;
    /** Additional openapi-typescript options */
    options?: {
        /** Enable alphabetize */
        alphabetize?: boolean;
        /** Array length */
        arrayLength?: boolean;
        /** Default non-nullable */
        defaultNonNullable?: boolean;
        /** Immutable types */
        immutableTypes?: boolean;
    };
}

/**
 * Load environment variables from .env file
 */
function loadEnvFile(envPath: string): Record<string, string> {
    const env: Record<string, string> = {};

    if (!existsSync(envPath)) {
        return env;
    }

    const content = readFileSync(envPath, "utf-8");
    const lines = content.split("\n");

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;

        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();

            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }

            env[key] = value;
        }
    }

    return env;
}

/**
 * Get backend URL from environment
 */
function getBackendUrl(): string {
    const rootDir = resolve(__dirname, "../..");
    const envPath = resolve(rootDir, ".env");
    const envVars = loadEnvFile(envPath);

    return envVars.BACKEND_API_URL || process.env.BACKEND_API_URL || "http://localhost:8000";
}

/**
 * OpenAPI Generator Configuration
 */
const config: OpenapiConfig = {
    swaggerUrl: `${getBackendUrl()}/swagger/v1/swagger.json`,
    outputPath: resolve(__dirname, "api-schema.ts"),
    options: {
        alphabetize: true,
        immutableTypes: false,
        defaultNonNullable: true,
    },
};

export default config;
