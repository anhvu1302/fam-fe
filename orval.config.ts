import { defineConfig } from 'orval'

export default defineConfig({
    api: {
        input: `${process.env.NEXT_PUBLIC_BACKEND_URL}/swagger/v1/swagger.json`,
        output: {
            mode: 'single', // Gộp tất cả vào 1 file
            target: 'src/generated/api.ts',
            client: 'react-query',
            httpClient: 'axios',
            baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
            override: {
                mutator: {
                    path: 'src/libs/custom-instance.ts',
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
