import { ActionFunction, redirect } from '@remix-run/cloudflare'
import { getSession } from '~/session'

export const action: ActionFunction = async ({ request, params }) => {
	const session = await getSession(request.headers.get('Cookie'))
	const { prefix, pid, size } = params
	const photoPath = `moul/photos/${prefix}/${pid}/${size}`

	if (!session.has('auth')) {
		return redirect('/_moul')
	}
	if (request.method === 'PUT' || request.method == 'POST') {
		if (typeof MOUL_BUCKET === 'undefined') {
			await fetch(
				`http://localhost:3030/r2?prefix=${prefix}&pid=${pid}&size=${size}`,
				{
					method: 'POST',
					headers: { 'content-type': 'image/jpeg' },
					body: request.body,
				}
			)

			return new Response(null)
		}

		const object = await MOUL_BUCKET.put(photoPath, request.body, {
			httpMetadata: request.headers,
		})
		return new Response(null, {
			headers: {
				etag: object.httpEtag,
			},
		})
	}
	if (request.method === 'DELETE') {
		await MOUL_BUCKET.delete(photoPath)
		return new Response()
	}

	return new Response(`Method Not Allowed`, {
		status: 405,
	})
}
