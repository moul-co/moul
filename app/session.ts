import { createCookieSessionStorage } from '@remix-run/cloudflare'

const { getSession, commitSession, destroySession } =
	createCookieSessionStorage({
		cookie: {
			name: '__moul',
			secrets: [MOUL_SESSION_SECRET],
			maxAge: 604800,
			// secure: true,
		},
	})

export { getSession, commitSession, destroySession }
