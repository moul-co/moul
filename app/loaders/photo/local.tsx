import { json, LoaderFunction } from '@remix-run/node'
import { Photo } from '~/utils'

export const loader: LoaderFunction = async ({ request, params }) => {
	const storiesReq = await fetch(`http://localhost:3000/__moul/stories.json`)
	const stories = await storiesReq.json()

	const { slug, hash } = params
	const story = stories.find((story: any) => story.slug === slug)
	const currentPhoto = story?.photos.find((p: Photo) => p.hash === hash)
	const title = story?.blocks.find((b: any) => b.type === 'title')?.text

	return json(
		{
			currentPhoto,
			photos: story?.photos,
			slug,
			story,
			title,
		},
		{
			headers: { Link: request.url },
		}
	)
}
