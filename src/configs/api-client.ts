import { client } from '@generated/client.gen'

// Configure the API client with baseUrl from environment variable
// This file is NOT auto-generated, so it won't be overwritten when regenerating API

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

client.setConfig({
  baseUrl: BACKEND_URL,
})

export { client }
