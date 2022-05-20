import { LoaderFunction } from '@remix-run/cloudflare'
import { getSession } from '~/session'

function objectNotFound(objectName: string): Response {
	return new Response(
		`<html><body>Photo "<b>${objectName}</b>" not found</body></html>`,
		{
			status: 404,
			headers: {
				'content-type': 'text/html; charset=UTF-8',
			},
		}
	)
}

function parseRange(
	encoded: string | null
): undefined | { offset: number; length: number } {
	if (encoded === null) {
		return
	}

	const parts = encoded.split('-')
	if (parts.length !== 2) {
		throw new Error(
			'Not supported to skip specifying the beginning/ending byte at this time'
		)
	}

	return {
		offset: Number(parts[0]),
		length: Number(parts[1]) + 1 - Number(parts[0]),
	}
}

export const loader: LoaderFunction = async ({ request, params }) => {
	const { pid, size } = params
	const photoPath = `moul/photos/${pid}/${size}`
	const session = await getSession(request.headers.get('Cookie'))
	if (size == 'original' && !session.has('auth')) {
		return new Response('Unauthorized', { status: 401 })
	}

	if (request.method === 'GET' || request.method === 'HEAD') {
		// if (request.method == 'HEAD') {
		//   return new Response(undefined, { status: 400 })
		// }
		// const options: R2ListOptions = {
		//   prefix: url.searchParams.get('prefix') ?? undefined,
		//   delimiter: url.searchParams.get('delimiter') ?? undefined,
		//   cursor: url.searchParams.get('cursor') ?? undefined,
		//   include: ['customMetadata', 'httpMetadata'],
		// }
		// console.log(JSON.stringify(options))

		// const listing = await MOUL_BUCKET.list(options)
		// return new Response(JSON.stringify(listing), {headers: {
		//   'content-type': 'application/json; charset=UTF-8',
		// }})
		// }

		if (request.method === 'GET') {
			const object = await MOUL_BUCKET.get(photoPath, {
				range: parseRange(request.headers.get('range')),
				onlyIf: request.headers,
			})
			if (object === null) {
				return objectNotFound(photoPath)
			}

			const headers = new Headers()
			object.writeHttpMetadata(headers)
			headers.set('etag', object.httpEtag)
			return new Response(object.body, {
				headers,
			})
		}

		const object = await MOUL_BUCKET.head(photoPath, {
			onlyIf: request.headers,
		})

		if (object === null) {
			return objectNotFound(photoPath)
		}

		const headers = new Headers()
		object.writeHttpMetadata(headers)
		headers.set('etag', object.httpEtag)
		return new Response(null, {
			headers,
		})
	}

	return new Response(`Method Not Allowed`, {
		status: 405,
	})
}
