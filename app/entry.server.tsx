import type { EntryContext } from '@remix-run/cloudflare'
import { RemixServer } from '@remix-run/react'
import { renderToString } from 'react-dom/server'
import { createHash } from '~/utilities'

export default async function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext
) {
	let markup = renderToString(
		<RemixServer context={remixContext} url={request.url} />
	)

	responseHeaders.set('Content-Type', 'text/html')
	const etag = await createHash(markup)
	if (etag === request.headers.get('if-none-match')) {
		return new Response('', { status: 304 })
	}
	if (
		(responseStatusCode === 200 && request.method === 'GET') ||
		request.method === 'HEAD'
	) {
		responseHeaders.set('ETag', `"${etag}"`)
	}

	return new Response('<!DOCTYPE html>' + markup, {
		status: responseStatusCode,
		headers: responseHeaders,
	})
}
