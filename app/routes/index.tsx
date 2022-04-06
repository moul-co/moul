import {
	HeadersFunction,
	json,
	LoaderFunction,
	MetaFunction,
	useLoaderData,
} from 'remix'
import Stories from '~/components/stories'

import { Profile } from '~/components/profile'
import Cover from '~/components/cover'

import profile from '~/data/profile.json'
import storiesJSON from '~/data/stories.json'
import { getPhotoSrc } from '~/utils'

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

export const headers: HeadersFunction = ({ loaderHeaders }) => {
	return {
		Link: `${loaderHeaders.get('Link')}; rel="canonical"`,
	}
}

export const meta: MetaFunction = ({ data }) => {
	const { name, bio, social, cover } = data.profile
	const imgURL =
		cover && cover.bh ? getPhotoSrc(cover) : cover && cover.url ? cover.url : ''

	return {
		title: name,
		description: bio,
		'og:title': name,
		'og:url': data.canonical,
		'og:description': bio,
		'og:image': imgURL,
		'twitter:card': 'summary_large_image',
		'twitter:creator': social.twitter ? social.twitter : '',
	}
}

export default function Index() {
	const { profile, stories } = useLoaderData()
	return (
		<div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
			{profile?.cover && (
				<section className="w-full h-[350px] md:h-[450px] lg:h-[600px] xl:h-[650px] relative mb-16">
					<Cover photo={profile.cover} />
				</section>
			)}
			<Profile profile={profile} />
			<Stories stories={stories} />
			{profile.name && (
				<footer className="flex flex-col w-full text-center my-16 text-neutral-500 dark:text-neutral-400">
					<p>Copyright © {profile.name}. All Rights Reserved.</p>
				</footer>
			)}
		</div>
	)
}
