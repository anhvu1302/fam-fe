// Third-party Imports
import CredentialProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'

// Generated API imports
import { postApiAuthLogin, postApiAuthRefresh, type UserInfoDto } from '@/generated/api'

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: UserInfoDto & {
      name?: string
      image?: string
    }
    accessToken?: string
    refreshToken?: string
  }

  interface User extends UserInfoDto {
    accessToken?: string
    refreshToken?: string
    accessTokenExpiresAt?: string
    refreshTokenExpiresAt?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    accessTokenExpiresAt?: string
    refreshTokenExpiresAt?: string
    user?: UserInfoDto
  }
}

/**
 * Helper function to refresh access token
 * Called when access token is about to expire
 */
async function refreshAccessToken(token: {
  accessToken?: string
  refreshToken?: string
  accessTokenExpiresAt?: string
  refreshTokenExpiresAt?: string
  user?: Partial<UserInfoDto>
}) {
  try {
    if (!token.refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await postApiAuthRefresh({
      refreshToken: token.refreshToken
    })

    if (!response.success) {
      throw new Error('Failed to refresh token')
    }

    const result = response.result

    if (!result) {
      throw new Error('No result in refresh response')
    }

    // Return updated token with new values
    return {
      ...token,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken ?? token.refreshToken,
      accessTokenExpiresAt: result.accessTokenExpiresAt,
      refreshTokenExpiresAt: result.refreshTokenExpiresAt ?? token.refreshTokenExpiresAt,
      error: undefined
    }
  } catch (error) {
    console.error('Error refreshing access token:', error)

    // Return the old token with an error flag
    return {
      ...token,
      error: 'RefreshAccessTokenError'
    }
  }
}

export const authOptions: NextAuthOptions = {
  // ** Configure one or more authentication providers
  // ** Please refer to https://next-auth.js.org/configuration/options#providers for more `providers` options
  providers: [
    CredentialProvider({
      // ** The name to display on the sign in form (e.g. 'Sign in with...')
      // ** For more details on Credentials Provider, visit https://next-auth.js.org/providers/credentials
      name: 'Credentials',
      type: 'credentials',

      /*
       * As we are using our own Sign-in page, we do not need to change
       * username or password attributes manually in following credentials object.
       */
      credentials: {},
      async authorize(credentials) {
        /*
         * You need to provide your own logic here that takes the credentials submitted and returns either
         * an object representing a user or value that is false/null if the credentials are invalid.
         * For e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
         * You can also use the `req` object to obtain additional parameters (i.e., the request IP address)
         */
        // NextAuth sends credentials as Record<string, string>
        const creds = credentials as Record<string, string>
        const identity = creds.identity || ''
        const password = creds.password || ''
        const parsedRememberMe = creds.rememberMe === 'true'

        // ** Login API Call - unified response format, no try-catch needed
        const response = await postApiAuthLogin({
          identity,
          password,
          rememberMe: parsedRememberMe
        })

        // Check if response is successful - TypeScript narrows type automatically
        if (!response.success) {
          // TypeScript knows response is ApiReturnFailure here
          const errorMessage = response.errors[0]?.message || 'Login failed'

          throw new Error(JSON.stringify({
            message: [errorMessage]
          }))
        }

        // TypeScript knows response is ApiReturnSuccess here
        const loginResult = response.result

        if (loginResult) {
          // Handle 2FA requirement
          if (loginResult.requiresTwoFactor) {
            throw new Error(JSON.stringify({
              message: ['Two-factor authentication required'],
              requiresTwoFactor: true,
              twoFactorSessionToken: loginResult.twoFactorSessionToken
            }))
          }

          // Return user data with tokens
          return {
            ...loginResult.user,
            id: loginResult.user?.id?.toString() || '',
            name: loginResult.user?.fullName || loginResult.user?.username,
            email: loginResult.user?.email,
            image: loginResult.user?.avatar ?? undefined,
            accessToken: loginResult.accessToken,
            refreshToken: loginResult.refreshToken,
            accessTokenExpiresAt: loginResult.accessTokenExpiresAt,
            refreshTokenExpiresAt: loginResult.refreshTokenExpiresAt
          }
        }

        return null
      }
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    })

    // ** ...add more providers here
  ],

  // ** Please refer to https://next-auth.js.org/configuration/options#session for more `session` options
  session: {
    /*
     * Choose how you want to save the user session.
     * The default is `jwt`, an encrypted JWT (JWE) stored in the session cookie.
     * If you use an `adapter` however, NextAuth default it to `database` instead.
     * You can still force a JWT session by explicitly defining `jwt`.
     * When using `database`, the session cookie will only contain a `sessionToken` value,
     * which is used to look up the session in the database.
     * If you use a custom credentials provider, user accounts will not be persisted in a database by NextAuth.js (even if one is configured).
     * The option to use JSON Web Tokens for session tokens must be enabled to use a custom credentials provider.
     */
    strategy: 'jwt',

    // ** Seconds - How long until an idle session expires and is no longer valid
    maxAge: 30 * 24 * 60 * 60 // ** 30 days
  },

  // ** Please refer to https://next-auth.js.org/configuration/options#pages for more `pages` options
  pages: {
    signIn: '/login'
  },

  // ** Please refer to https://next-auth.js.org/configuration/options#callbacks for more `callbacks` options
  callbacks: {
    /*
     * While using `jwt` as a strategy, `jwt()` callback will be called before
     * the `session()` callback. So we have to add custom parameters in `token`
     * via `jwt()` callback to make them accessible in the `session()` callback
     */
    async jwt({ token, user }) {
      // Initial sign in - store tokens from user
      if (user) {
        /*
         * For adding custom parameters to user in session, we first need to add those parameters
         * in token which then will be available in the `session()` callback
         */
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.accessTokenExpiresAt = user.accessTokenExpiresAt
        token.refreshTokenExpiresAt = user.refreshTokenExpiresAt
        token.user = {
          id: user.id ? Number(user.id) : undefined,
          username: user.username ?? undefined,
          email: user.email ?? undefined,
          firstName: user.firstName ?? undefined,
          lastName: user.lastName ?? undefined,
          fullName: user.fullName ?? undefined,
          avatar: user.avatar ?? undefined,
          phoneNumber: user.phoneNumber ?? undefined,
          isEmailVerified: user.isEmailVerified,
          isTwoFactorEnabled: user.isTwoFactorEnabled
        }

        return token
      }

      // Check if access token is about to expire (5 minutes buffer)
      const accessTokenExpiresAt = token.accessTokenExpiresAt
        ? new Date(token.accessTokenExpiresAt as string).getTime()
        : 0

      const now = Date.now()
      const fiveMinutesInMs = 5 * 60 * 1000

      // Token is still valid
      if (accessTokenExpiresAt - now > fiveMinutesInMs) {
        return token
      }

      // Token is about to expire, try to refresh
      console.log('Access token is about to expire, refreshing...')

      return await refreshAccessToken(token as Parameters<typeof refreshAccessToken>[0])
    },
    async session({ session, token }) {
      if (token) {
        // ** Add custom params to session
        session.accessToken = token.accessToken
        session.refreshToken = token.refreshToken

        if (token.user) {
          session.user = {
            ...token.user,
          }
          session.accessToken = token.accessToken
        }
      }

      return session
    }
  }
}
