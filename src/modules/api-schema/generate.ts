#!/usr/bin/env tsx

/**
 * OpenAPI TypeScript Generator Script
 * 
 * Usage:
 *   pnpm generate:api-schema
 *   pnpm generate:api-schema --watch
 */

import { execSync } from "child_process";
import { resolve } from "path";

async function main() {
    const args = process.argv.slice(2);
    const isWatch = args.includes("--watch") || args.includes("-w");

    // Import config
    const configPath = resolve(__dirname, "openapi.config.ts");
    const { default: config } = await import(configPath);

    console.log("📝 Generating API Schema Types...");
    console.log(`   Swagger URL: ${config.swaggerUrl}`);
    console.log(`   Output: ${config.outputPath}`);
    if (isWatch) {
        console.log(`   Mode: Watch mode 👀`);
    }
    console.log("");

    try {
        const watchFlag = isWatch ? "--watch" : "";
        const alphabetizeFlag = config.options?.alphabetize ? "--alphabetize" : "";
        const immutableFlag = config.options?.immutableTypes ? "--immutable-types" : "";
        const defaultNonNullableFlag = config.options?.defaultNonNullable ? "--default-non-nullable" : "";

        const flags = [watchFlag, alphabetizeFlag, immutableFlag, defaultNonNullableFlag]
            .filter(Boolean)
            .join(" ");

        const command = `npx openapi-typescript "${config.swaggerUrl}" -o "${config.outputPath}" ${flags}`.trim();

        execSync(command, {
            stdio: "inherit",
            cwd: resolve(__dirname, "../.."),
        });

        if (!isWatch) {
            console.log("");
            console.log("✅ API Schema types generated successfully!");
        }
    } catch (_error) {
        console.error("");
        console.error("❌ Failed to generate API Schema types");
        console.error("");
        console.error("Please ensure:");
        console.error(`  1. Backend API is running`);
        console.error(`  2. Swagger endpoint is accessible at ${config.swaggerUrl}`);
        console.error(`  3. BACKEND_API_URL is correctly set in .env file`);
        console.error("");
        process.exit(1);
    }
}

main();
