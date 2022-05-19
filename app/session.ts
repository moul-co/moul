import { createCookieSessionStorage } from '@remix-run/cloudflare'

declare var SESSION_SECRET: string

const { getSession, commitSession, destroySession } =
	createCookieSessionStorage({
		cookie: {
			name: '__moul',
			secrets: [SESSION_SECRET],
			maxAge: 604800,
			// secure: true,
		},
	})

export { getSession, commitSession, destroySession }
