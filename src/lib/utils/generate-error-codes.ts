/**
 * Generate Error Codes Script
 * 
 * Fetches error codes from backend API and generates:
 * - TypeScript types for error codes (union + mapping)
 * - TypeScript constants for error codes (for type-safe references)
 * 
 * Locale files (manual maintenance):
 * - src/lib/utils/errors.en.ts - English (reference from API)
 * - src/lib/utils/errors.vi.ts - Vietnamese (manually translated, type-checked)
 * 
 * Usage: pnpm generate:errors
 */

import fs from "fs";
import path from "path";

interface ErrorCode {
    code: string;
    message: string;
}

interface ErrorCodesResponse {
    success: boolean;
    message: string | null;
    result: {
        errorCodes: ErrorCode[];
    };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const ERROR_CODES_ENDPOINT = `${API_URL}/error-codes`;

// Output paths
const TYPES_OUTPUT = path.join(process.cwd(), "src/lib/types/error-codes.ts");
const CONSTANTS_OUTPUT = path.join(process.cwd(), "src/lib/constants/error-codes.ts");

async function fetchErrorCodes(): Promise<ErrorCode[]> {
    try {
        console.log(`📡 Fetching error codes from: ${ERROR_CODES_ENDPOINT}`);

        const response = await fetch(ERROR_CODES_ENDPOINT);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ErrorCodesResponse = await response.json();

        if (!data.success || !data.result?.errorCodes) {
            throw new Error("Invalid response format from API");
        }

        console.log(`✅ Fetched ${data.result.errorCodes.length} error codes`);
        return data.result.errorCodes;
    } catch (error) {
        console.error("❌ Failed to fetch error codes:", error);
        throw error;
    }
}

function generateTypesFile(errorCodes: ErrorCode[]): string {
    const codes = errorCodes.map((ec) => `  | "${ec.code}"`).join("\n");

    return `/**
 * Error Codes Types
 * 
 * Auto-generated from backend API
 * DO NOT EDIT MANUALLY
 * 
 * Generated at: ${new Date().toISOString()}
 */

/**
 * All possible error codes from backend
 */
export type ErrorCode =
${codes};

/**
 * Error code to translation key mapping
 */
export const ERROR_CODE_KEYS: Record<ErrorCode, string> = {
${errorCodes.map((ec) => `  "${ec.code}": "errors.${ec.code}",`).join("\n")}
};

/**
 * Check if a string is a valid error code
 */
export function isErrorCode(code: string): code is ErrorCode {
  return code in ERROR_CODE_KEYS;
}

/**
 * Get translation key for error code
 */
export function getErrorTranslationKey(code: ErrorCode): string {
  return ERROR_CODE_KEYS[code];
}
`;
}

function generateConstantsFile(errorCodes: ErrorCode[]): string {
    // Group error codes by prefix (category)
    const categories = new Map<string, string[]>();
    errorCodes.forEach((ec) => {
        const prefix = ec.code.split("_")[0];
        if (!categories.has(prefix)) {
            categories.set(prefix, []);
        }
        categories.get(prefix)!.push(ec.code);
    });

    // Sort by category
    const sortedCategories = Array.from(categories.entries()).sort((a, b) => a[0].localeCompare(b[0]));

    const categorizedCodes = sortedCategories
        .map(([category, codes]) => {
            const categoryCodesStr = codes.map((code) => `  ${code}: "${code}",`).join("\n");
            return `  // ${category}\n${categoryCodesStr}`;
        })
        .join("\n\n");

    return `/**
 * Error Code Constants
 * 
 * Auto-generated from backend API
 * DO NOT EDIT MANUALLY
 * 
 * Generated at: ${new Date().toISOString()}
 * 
 * Usage:
 *   if (errorCode === ERROR_CODES.AUTH_ACCOUNT_LOCKED) { ... }
 *   
 * Benefits:
 *   - Type-safe error code references
 *   - IDE autocomplete support
 *   - Prevents typos in error code strings
 */

import type { ErrorCode } from "@/lib/types/error-codes";

/**
 * Type-safe constant references for all error codes
 * Organized by category for easier navigation
 */
export const ERROR_CODES: Record<ErrorCode, ErrorCode> = {
${categorizedCodes}
};

/**
 * Type for getting keys from ERROR_CODES object
 * Useful for autocomplete when referencing error codes
 */
export type ErrorCodeKey = keyof typeof ERROR_CODES;

/**
 * Check if a value is a valid error code key
 */
export function isErrorCodeKey(key: string): key is ErrorCodeKey {
  return key in ERROR_CODES;
}
`;
}

function printEnglishTranslations(errorCodes: ErrorCode[]): void {
    const translations = errorCodes
        .map((ec) => `    ${ec.code}: "${ec.message.replace(/"/g, '\\"')}",`)
        .join("\n");

    console.log("\n📝 English translations (reference for errors.en.ts):");
    console.log("   Update src/lib/utils/errors.en.ts with these messages");
}

function writeFile(filePath: string, content: string): void {
    const dir = path.dirname(filePath);

    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`✅ Generated: ${filePath}`);
}

async function main() {
    try {
        console.log("🚀 Starting error codes generation...\n");

        // Fetch error codes from API
        const errorCodes = await fetchErrorCodes();

        // Generate TypeScript types
        console.log("\n📝 Generating TypeScript types...");
        const typesContent = generateTypesFile(errorCodes);
        writeFile(TYPES_OUTPUT, typesContent);

        // Generate TypeScript constants
        console.log("📝 Generating TypeScript constants...");
        const constantsContent = generateConstantsFile(errorCodes);
        writeFile(CONSTANTS_OUTPUT, constantsContent);

        // Print English translations for reference
        printEnglishTranslations(errorCodes);

        console.log("\n✨ Error codes generation completed successfully!");
        console.log(`\n📊 Generated files:`);
        console.log(`   - Types: ${TYPES_OUTPUT}`);
        console.log(`   - Constants: ${CONSTANTS_OUTPUT}`);
        console.log(`   - Total error codes: ${errorCodes.length}`);
        console.log("\n📝 Manual files (in src/lib/utils/):");
        console.log(`   - errors.en.ts - English translations (type-checked)`);
        console.log(`   - errors.vi.ts - Vietnamese translations (type-checked)`);
        console.log(`\n💡 TypeScript will error if translation files have missing/extra keys`);

    } catch (error) {
        console.error("\n❌ Error codes generation failed:", error);
        process.exit(1);
    }
}

main();
