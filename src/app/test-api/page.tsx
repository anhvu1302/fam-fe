"use client";

import { useState } from "react";

import apiClient, { ApiError } from "@/lib/axios-client";

interface JwksKey {
    kty: string;
    use: string;
    kid: string;
    alg: string;
    n: string;
    e: string;
}

interface JwksResponse {
    keys: JwksKey[];
}

interface ErrorInfo {
    message: string;
    status?: number;
    code?: string;
}

export default function TestApiPage() {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<JwksResponse | null>(null);
    const [error, setError] = useState<ErrorInfo | null>(null);
    const [networkLog, setNetworkLog] = useState<string>("");

    const testApi = async () => {
        setLoading(true);
        setError(null);
        setResponse(null);
        setNetworkLog("");

        try {
            // Log để xem request
            console.log("🚀 Calling API via proxy...");

            const res = await apiClient.get<JwksResponse>("/api/.well-known/jwks.json");

            console.log("✅ Response (decrypted):", res.data);

            setResponse(res.data);
            setNetworkLog(
                "✅ Kiểm tra Network Tab (F12):\n" +
                "- Response sẽ có dạng: { iv, content, h }\n" +
                "- Nhưng ở đây đã được giải mã tự động!"
            );
        } catch (err) {
            console.error("❌ Error:", err);

            // Xử lý error an toàn - không lộ thông tin nhạy cảm
            if (err instanceof ApiError) {
                setError({
                    message: err.message,
                    status: err.status,
                    code: err.code,
                });
            } else if (err instanceof Error) {
                setError({ message: err.message });
            } else {
                setError({ message: "An unexpected error occurred" });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-900 p-8 text-white">
            <div className="mx-auto max-w-4xl">
                <h1 className="mb-2 text-3xl font-bold">🔐 Test Proxy API</h1>
                <p className="mb-8 text-zinc-400">
                    Test API với mã hóa Encrypt-then-MAC qua Next.js Proxy
                </p>

                <div className="mb-6 rounded-lg bg-zinc-800 p-4">
                    <h2 className="mb-2 font-semibold text-zinc-300">API Endpoint:</h2>
                    <code className="text-green-400">GET /.well-known/jwks.json</code>
                    <p className="mt-2 text-sm text-zinc-500">
                        Gọi qua proxy - Backend URL được ẩn hoàn toàn
                    </p>
                </div>

                <button
                    onClick={testApi}
                    disabled={loading}
                    className="mb-8 rounded-lg bg-blue-600 px-6 py-3 font-semibold transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "⏳ Loading..." : "🚀 Test API"}
                </button>

                {networkLog && (
                    <div className="mb-6 rounded-lg bg-yellow-900/30 p-4">
                        <h2 className="mb-2 font-semibold text-yellow-400">
                            📡 Network Info:
                        </h2>
                        <pre className="whitespace-pre-wrap text-sm text-yellow-200">
                            {networkLog}
                        </pre>
                    </div>
                )}

                {error && (
                    <div className="mb-6 rounded-lg bg-red-900/30 p-4">
                        <h2 className="mb-2 font-semibold text-red-400">❌ Error:</h2>
                        <div className="text-sm text-red-200">
                            <p>
                                <strong>Message:</strong> {error.message}
                            </p>
                            {error.status && (
                                <p>
                                    <strong>Status:</strong> {error.status}
                                </p>
                            )}
                            {error.code && (
                                <p>
                                    <strong>Code:</strong> {error.code}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {response && (
                    <div className="rounded-lg bg-green-900/30 p-4">
                        <h2 className="mb-2 font-semibold text-green-400">
                            ✅ Response (Decrypted):
                        </h2>
                        <pre className="overflow-auto text-sm text-green-200">
                            {JSON.stringify(response, null, 2)}
                        </pre>
                    </div>
                )}

                <div className="mt-8 rounded-lg bg-zinc-800 p-4">
                    <h2 className="mb-2 font-semibold text-zinc-300">
                        🔍 Cách kiểm tra:
                    </h2>
                    <ol className="list-inside list-decimal space-y-2 text-sm text-zinc-400">
                        <li>Mở DevTools (F12) → Tab Network</li>
                        <li>Nhấn nút &quot;Test API&quot;</li>
                        <li>Response trong Network sẽ là: {`{ iv, content, h }`}</li>
                        <li>Nhưng trên UI đã được giải mã tự động!</li>
                        <li>
                            <strong className="text-yellow-400">
                                Khi có lỗi: không lộ URL backend gốc!
                            </strong>
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
}