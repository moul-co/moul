import { json, LoaderFunction } from '@remix-run/node'

export const loader: LoaderFunction = async ({ request }) => {
	const profileReq = await fetch(`http://localhost:3000/__moul/profile.json`)
	const profile = await profileReq.json()

	const storiesReq = await fetch(`http://localhost:3000/__moul/stories.json`)
	const storiesJson = await storiesReq.json()

	const stories = storiesJson.map((s: any) => {
		const cover = s.photos.find((p: any) => p.type === 'cover')
		const title = s.blocks.find((b: any) => b.type === 'title')
		return {
			slug: s.slug,
			cover,
			title: title?.text,
		}
	})

	return json(
		{
			profile,
			stories,
			canonical: request.url,
		},
		{ headers: { Link: request.url } }
	)
}
