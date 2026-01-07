/**
 * Custom fetch instance for orval generated API calls
 * This file handles authentication, error handling, and base URL configuration
 */

/**
 * Custom fetcher for orval - accepts URL and options as separate parameters
 */
export const customInstance = async <TResponse>(
    url: string,
    options?: RequestInit
): Promise<TResponse> => {
    // Prepare headers
    const headers: Record<string, string> = {
        ...(options?.headers as Record<string, string>)
    }

    // Add auth token if available (customize based on your auth setup)
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
        ...options,
        headers
    })

    // Handle response based on status
    const contentType = response.headers.get('content-type')
    let data: unknown = undefined

    if (contentType && contentType.includes('application/json')) {
        data = await response.json().catch(() => undefined)
    }

    return {
        data,
        status: response.status,
        headers: response.headers
    } as TResponse
}

export default customInstance
