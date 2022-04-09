import { HeadersFunction, MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { Stories } from '~/components/stories'
import { Cover } from '~/components/cover'
import { Profile } from '~/components/profile'
import { getPhotoSrc } from '~/utils'

// export { loader } from '~/loaders/index/prod'
export { loader } from '~/loaders/index/local'

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
		<>
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
		</>
	)
}
