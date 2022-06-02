import {
	json,
	LoaderFunction,
	HeadersFunction,
	MetaFunction,
} from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'

import { Stories, Cover, Profile } from '~/components/story'
import { Photo } from '~/types'
import { getPhotoSrc } from '~/utilities'

export const loader: LoaderFunction = async ({ request }) => {
	let profile = await MOUL_KV.get('profile', { type: 'json' })
	const photosKeys = await MOUL_KV.list({ prefix: `photo-` })
	const photos: Photo[] = []
	if (photosKeys) {
		for (let key of photosKeys.keys) {
			const photo = (await MOUL_KV.get(key.name, { type: 'json' })) as Photo
			if (photo) {
				photos.push(photo)
			}
		}
	}

	const listStories = await MOUL_KV.list({ prefix: 'story-' })
	const stories = []
	if (listStories) {
		for (let key of listStories.keys) {
			const story = (await MOUL_KV.get(key.name, { type: 'json' })) as any
			if (story) {
				let slugArr = key.name.split('-')
				slugArr.shift()
				story.slug = slugArr.join('-')
				const coverExist = story.children.find((c: any) => c.name === 'cover')
				story.title = story.children.find((c: any) => c.name === 'title')
				story.cover = photos.find(
					(p: Photo) => p.pid === coverExist?.children[0].attributes.pid
				)
				stories.push(story)
			}
		}
	}
	if (!profile)
		profile = {
			name: '',
			bio: '',
			github: '',
			twitter: '',
			youtube: '',
			instagram: '',
			facebook: '',
		}

	return json(
		{ profile, stories, photos, canonical: request.url },
		{ headers: { Link: request.url } }
	)
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
	// 30 mins, 1 week, 1 year
	// max-age=1800, s-maxage=604800, stale-while-revalidate=31540000000
	let cacheControl = loaderHeaders.get('Link')?.includes('localhost:')
		? 'public, max-age=0, must-revalidate'
		: 'public, max-age=1, s-maxage=604800, stale-while-revalidate=31540000000'

	return {
		Link: `${loaderHeaders.get('Link')}; rel="canonical"`,
		'Cache-Control': cacheControl,
	}
}

export const meta: MetaFunction = ({ data }) => {
	const { name, bio, twitter, cover } = data?.profile
	const url = new URL(data.canonical)
	const imgURL =
		cover && cover?.blurhash
			? `${url.protocol}//${url.host}${getPhotoSrc(cover)}`
			: cover && cover?.url
			? cover?.url
			: ''

	return {
		title: name,
		description: bio,
		'og:title': name,
		'og:url': data.canonical,
		'og:description': bio,
		'og:image': imgURL,
		'twitter:card': 'summary_large_image',
		'twitter:creator': twitter ? twitter : '',
	}
}

export default function Index() {
	const { profile, stories } = useLoaderData()
	return (
		<>
			{profile?.cover?.name && (
				<section className="w-full h-[350px] md:h-[450px] lg:h-[600px] xl:h-[650px] relative mb-16">
					<Cover photo={profile.cover} />
				</section>
			)}
			{profile && <Profile profile={profile} />}
			<Stories stories={stories} />
			{profile?.name && (
				<footer className="flex flex-col w-full text-center px-6 my-16 text-neutral-500 dark:text-neutral-400">
					<p>Copyright © {profile.name}. All Rights Reserved.</p>
				</footer>
			)}
		</>
	)
}
