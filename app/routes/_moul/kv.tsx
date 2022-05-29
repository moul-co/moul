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
	if (prefix === 'story') {
		const key = `story-${slug}`
		await MOUL_KV.put(key, body)
		return new Response('ok')
	}
	if (prefix?.startsWith('photo-')) {
		await MOUL_KV.put(prefix, body)
		return new Response('ok')
	}

	const profileKV = (await MOUL_KV.get('profile')) as any
	let profile = JSON.parse(profileKV)
	const parsedBody = JSON.parse(body)
	if (prefix === 'profile') {
		profile = { ...profile, ...parsedBody }
	}
	if (prefix === 'profile-picture') {
		profile.picture = parsedBody
	}
	if (prefix === 'profile-cover') {
		profile.cover = parsedBody
	}

	await MOUL_KV.put('profile', JSON.stringify(profile))

	return new Response('ok')
}
