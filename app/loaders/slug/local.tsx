import { json, LoaderFunction } from '@remix-run/node'

export const loader: LoaderFunction = async ({ request }) => {
	const storiesReq = await fetch(`http://localhost:3000/__moul/stories.json`)
	const stories = await storiesReq.json()

	if (new URL(request.url).pathname === '/favicon.ico') return null
	const slug = new URL(request.url).pathname.split('/').pop() || ''
	const story = stories.find((s: any) => s.slug == slug)
	const cover = story?.photos.find((p: any) => p.type === 'cover')
	const title = story?.blocks.find((b: any) => b.type === 'title')?.text

	return json(
		{ status: 'ok', story, cover, title, canonical: request.url },
		{ headers: { Link: request.url } }
	)
}
