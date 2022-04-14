import {
	json,
	LoaderFunction,
	HeadersFunction,
	MetaFunction,
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { Stories, Cover, Profile } from '~/components'
import { getPhotoSrc } from '~/utils'
// import profile from '~/data/profile.json'
// import storiesJSON from '~/data/stories.json'

// export const loader: LoaderFunction = ({ request }) => {
// 	const stories = storiesJSON.map((s) => {
// 		const cover = s.photos.find((p) => p.type === 'cover')
// 		const title = s.blocks.find((b) => b.type === 'title')
// 		return {
// 			slug: s.slug,
// 			cover,
// 			title: title?.text,
// 		}
// 	})

// 	return json(
// 		{
// 			profile,
// 			stories,
// 			canonical: request.url,
// 		},
// 		{ headers: { Link: request.url } }
// 	)
// }
export const loader: LoaderFunction = async ({ request }) => {
	const profileReq = await fetch(`http://localhost:3000/__moul/profile.json`)
	const profile = await profileReq.json()

	const storiesReq = await fetch(`http://localhost:3000/__moul/stories.json`)
	const storiesJson = await storiesReq.json()

	const stories = storiesJson?.map((s: any) => {
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

export const headers: HeadersFunction = ({ loaderHeaders }) => {
	// 30 mins, 1 week, 1 year
	// max-age=1800, s-maxage=604800, stale-while-revalidate=31540000000
	let cacheControl = loaderHeaders.get('Link')?.includes('localhost:')
		? 'public, max-age=0, must-revalidate'
		: 'public, max-age=1800, s-maxage=604800, stale-while-revalidate=31540000000'

	return {
		Link: `${loaderHeaders.get('Link')}; rel="canonical"`,
		'Cache-Control': cacheControl,
	}
}

export const meta: MetaFunction = ({ data }) => {
	const { name, bio, social, cover } = data.profile
	const url = new URL(data.canonical)
	const imgURL =
		cover && cover.bh
			? `${url.protocol}//${url.host}${getPhotoSrc(cover)}`
			: cover && cover.url
			? cover.url
			: ''

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
		<>
			{profile?.cover && (
				<section className="w-full h-[350px] md:h-[450px] lg:h-[600px] xl:h-[650px] relative mb-16">
					<Cover photo={profile.cover} />
				</section>
			)}
			<Profile profile={profile} />
			<Stories stories={stories} />
			{profile.name && (
				<footer className="flex flex-col w-full text-center px-6 my-16 text-neutral-500 dark:text-neutral-400">
					<p>Copyright © {profile.name}. All Rights Reserved.</p>
				</footer>
			)}
		</>
	)
}
