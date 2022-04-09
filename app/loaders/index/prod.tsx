import { json, LoaderFunction } from '@remix-run/node'
import profile from '~/data/profile.json'
import storiesJSON from '~/data/stories.json'

export const loader: LoaderFunction = ({ request }) => {
	const stories = storiesJSON.map((s) => {
		const cover = s.photos.find((p) => p.type === 'cover')
		const title = s.blocks.find((b) => b.type === 'title')
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
