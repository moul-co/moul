import { ActionFunction, json, redirect } from '@remix-run/cloudflare'
import { getSession } from '~/session'

export const action: ActionFunction = async ({ request, params }) => {
	const session = await getSession(request.headers.get('Cookie'))
	if (session.get('auth') !== true) {
		return redirect('/_moul')
	}
	const url = new URL(request.url)
	const prefix = url.searchParams.get('prefix')!
	const slug = url.searchParams.get('slug')
	const body = await request.text()
	if (prefix === 'md') {
		const key = `${prefix}-${slug}`
		await MOUL_KV.put(key, body)
		return new Response('ok')
	}

	if (prefix?.startsWith('photo-')) {
		const parsed = JSON.parse(body)
		parsed.url = ''
		await MOUL_KV.put(prefix, JSON.stringify(parsed))
		return new Response('ok')
	}

	const profileKV = (await MOUL_KV.get('profile')) as any
	let profile = JSON.parse(profileKV)
	const parsedBody = JSON.parse(body)
	if (prefix === 'story') {
		const key = `${prefix}-${slug}`
		const isCover = parsedBody?.children.find((t: any) => t.name === 'cover')
		const cover =
			isCover &&
			(await MOUL_KV.get(
				`photo-${slug}-${isCover.children[0].attributes.pid}`,
				{ type: 'json' }
			))
		const photos = [cover]
		for (let tag of parsedBody?.children) {
			if (tag.name === 'grid') {
				for (let t of tag.children) {
					const photo = await MOUL_KV.get(`photo-${slug}-${t.attributes.pid}`, {
						type: 'json',
					})
					photos.push(photo)
				}
			}
		}
		parsedBody.photos = photos
		await MOUL_KV.put(key, JSON.stringify(parsedBody))
		return new Response('ok')
	}

	if (prefix === 'profile') {
		profile = { ...profile, ...parsedBody }
	}
	if (prefix === 'profile-picture') {
		parsedBody.url = ''
		profile.picture = parsedBody
	}
	if (prefix === 'profile-cover') {
		parsedBody.url = ''
		profile.cover = parsedBody
	}

	await MOUL_KV.put('profile', JSON.stringify(profile))

	return new Response('ok')
}
