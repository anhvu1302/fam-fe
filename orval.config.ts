import { defineConfig } from 'orval'

export default defineConfig({
    api: {
        input: `${process.env.BACKEND_URL}/swagger/v1/swagger.json`,
        output: {
            mode: 'single', // Gộp tất cả vào 1 file
            target: 'src/generated/api.ts',
            client: 'react-query',
            httpClient: 'fetch',
            baseUrl: process.env.BACKEND_URL,
            override: {
                mutator: {
                    path: 'src/lib/api/custom-instance.ts',
                    name: 'customInstance'
                },
                query: {
                    useQuery: true,
                    useMutation: true,
                    useInfinite: false, // Tắt infinite query để tránh lỗi với endpoints không có pageNumber
                    options: {
                        staleTime: 10000
                    }
                }
            }
        }
    }
})
