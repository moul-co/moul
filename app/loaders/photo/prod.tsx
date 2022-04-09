import { json, LoaderFunction } from '@remix-run/node'
import stories from '~/data/stories.json'
import { Photo } from '~/utils'

export const loader: LoaderFunction = async ({ request, params }) => {
	const { slug, hash } = params
	const story = stories.find((story) => story.slug === slug)
	const currentPhoto = story?.photos.find((p: Photo) => p.hash === hash)
	const title = story?.blocks.find((b) => b.type === 'title')?.text

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
