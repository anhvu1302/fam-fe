import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: `${process.env.BACKEND_URL}/swagger/v1/swagger.json`,
  output: 'src/generated',
  plugins: [
    '@hey-api/typescript',
    '@hey-api/sdk'

    // {
    //   name: '@tanstack/react-query',
    //   hooks: true
    // }
  ]
})
