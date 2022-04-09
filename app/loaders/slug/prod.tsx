import { json, LoaderFunction } from '@remix-run/node'
import stories from '~/data/stories.json'

export const loader: LoaderFunction = async ({ request }) => {
	if (new URL(request.url).pathname === '/favicon.ico') return null
	const slug = new URL(request.url).pathname.split('/').pop() || ''
	const story = stories.find((s) => s.slug == slug)
	const cover = story?.photos.find((p) => p.type === 'cover')
	const title = story?.blocks.find((b) => b.type === 'title')?.text

	return json(
		{ status: 'ok', story, cover, title, canonical: request.url },
		{ headers: { Link: request.url } }
	)
}
