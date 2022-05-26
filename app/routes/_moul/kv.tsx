import { ActionFunction, json, redirect } from '@remix-run/cloudflare'
import { getSession } from '~/session'

export const action: ActionFunction = async ({ request, params }) => {
	const session = await getSession(request.headers.get('Cookie'))
	if (session.get('auth') !== 'true') {
		return redirect('/_moul')
	}
	const prefix = new URL(request.url).searchParams.get('prefix')
	const body = await request.text()

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
