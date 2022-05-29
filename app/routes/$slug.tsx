import {
	json,
	LoaderFunction,
	HeadersFunction,
	MetaFunction,
} from '@remix-run/cloudflare'
import { Link, useLoaderData } from '@remix-run/react'
import { useEffect } from 'react'

import { Profile } from '~/components/story'
import {
	getDimension,
	getPhotoSrc,
	getPhotoSrcSet,
	isBrowser,
} from '~/utilities'
import { Photo } from '~/types'
import Content from '~/components/content'

export const loader: LoaderFunction = async ({ request, params }) => {
	const { slug } = params
	const profile = await MOUL_KV.get('profile', { type: 'json' })
	const photosKeys = await MOUL_KV.list({ prefix: `photo-${slug}` })
	const photos: Photo[] = []
	if (photosKeys) {
		for (let key of photosKeys.keys) {
			const photo = (await MOUL_KV.get(key.name, { type: 'json' })) as Photo
			if (photo) {
				photos.push(photo)
			}
		}
	}
	const story = (await MOUL_KV.get(`story-${slug}`, { type: 'json' })) as any
	if (!story) {
		return new Response('not_found', { status: 404 })
	}

	const coverExist = story.children.find((c: any) => c.name === 'cover')
	story.title = story.children.find((c: any) => c.name === 'title')
	story.cover = photos.find(
		(p: Photo) => p.pid === coverExist?.children[0].attributes.pid
	)
	const title = story.title.children[0]?.children[0]

	return json(
		{
			status: 'ok',
			story,
			cover: story.cover,
			title,
			canonical: request.url,
			profile,
			photos,
		},
		{ headers: { Link: request.url } }
	)
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
	let cacheControl = loaderHeaders.get('Link')?.includes('localhost:')
		? 'public, max-age=0, must-revalidate'
		: 'public, max-age=1800, s-maxage=604800, stale-while-revalidate=31540000000'

	return {
		Link: `${loaderHeaders.get('Link')}; rel="canonical"`,
		'Cache-Control': cacheControl,
	}
}

export const meta: MetaFunction = ({ data }) => {
	if (data == 'not_found') return {}
	const { name, bio, twitter } = data.profile
	const { title: t, cover } = data
	const title = t ? `${t} | ${name}` : name
	const fallback = data.photos[0]
	const url = new URL(data.canonical)

	const imgURL =
		cover && cover?.blurhash
			? `${url.protocol}//${url.host}${getPhotoSrc(cover)}`
			: cover && cover?.blurhash
			? cover?.url
			: fallback && fallback?.blurhash
			? `${url.protocol}//${url.host}${getPhotoSrc(fallback)}`
			: fallback?.url

	return {
		title,
		description: bio,
		'og:title': title,
		'og:url': data.canonical,
		'og:description': bio,
		'og:image': imgURL,
		'twitter:card': 'summary_large_image',
		'twitter:creator': twitter ? twitter : '',
	}
}

export default function Story() {
	const { status, story, cover, title, photos, profile } = useLoaderData()

	return (
		<>
			{status === 'not_found' && <div>Not found!</div>}

			{status === 'ok' && (
				<>
					<div className="">
						{cover && (
							<div className="moul-cover w-full h-[350px] md:h-[450px] lg:h-[600px] xl:h-[650px] relative mb-16">
								<Link to={`photo/${cover?.pid}`} key={cover?.pid} className="">
									<picture className="absolute top-0 left-0 w-full h-full">
										<img
											src={`data:image/jpeg;charset=utf-8;base64,${cover?.blurhash}`}
											data-srcset={getPhotoSrcSet(cover)}
											data-sizes="auto"
											className="lazy w-full h-full object-cover"
											alt={cover.name}
										/>
									</picture>
								</Link>
							</div>
						)}
						<Profile profile={profile} />
						{title && (
							<div className="moul-content-title mx-auto font-bold max-w-3xl mb-6 text-neutral-900 dark:text-neutral-50 px-6 xs:px-0">
								<h1 className="text-3xl md:text-5xl">{title}</h1>
							</div>
						)}
					</div>
					<Content content={story} photos={photos} />

					<footer className="flex flex-col w-full text-center px-6 my-16 text-neutral-500 dark:text-neutral-400">
						{profile.name && (
							<p>Copyright © {profile.name}. All Rights Reserved.</p>
						)}
					</footer>
				</>
			)}
		</>
	)
}
