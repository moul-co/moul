import { useEffect } from 'react'
import { json, LoaderFunction, useLoaderData, Link, MetaFunction } from 'remix'
import { fixed_partition } from 'image-layout'

import { Profile } from '~/components/profile'
import { getDimension, getPhotoSrcSet, isBrowser, Photo } from '~/utils'

export let loader: LoaderFunction = async ({ request, params }) => {
	if (new URL(request.url).pathname === '/favicon.ico') {
		return null
	}
	const slug = new URL(request.url).pathname.split('/').pop() || ''

	let {
		MOUL_PROFILE_NAME,
		MOUL_PROFILE_BIO,
		MOUL_PROFILE_SOCIAL_TWITTER,
		MOUL_PROFILE_SOCIAL_GITHUB,
		MOUL_PROFILE_SOCIAL_YOUTUBE,
	} = process.env
	let profile = {
		name: MOUL_PROFILE_NAME,
		bio: MOUL_PROFILE_BIO,
		social: {
			twitter: MOUL_PROFILE_SOCIAL_TWITTER,
			github: MOUL_PROFILE_SOCIAL_GITHUB,
			youtube: MOUL_PROFILE_SOCIAL_YOUTUBE,
		},
	}
	console.log()

	let story = {
		profile,
	}
	console.log('story', story)

	return json({ status: 'ok', story })
}

export let meta: MetaFunction = ({ data }) => {
	let title =
		data.story?.title && data.story.profile?.name
			? `${data.story.title} | ${data.story.profile?.name}`
			: `${data.story.profile?.name}`

	let description = data.story?.description

	return {
		title,
		description,
	}
}

export default function Story() {
	const { status, story } = useLoaderData()

	useEffect(() => {
		paintGrid()

		if (isBrowser()) {
			window.addEventListener('resize', () => {
				paintGrid()
			})
		}
	}, [])

	let paintGrid = () => {
		console.time('grid')
		let grid = document.querySelectorAll('.moul-content-photos')
		grid.forEach((el: any) => {
			let photos = el.querySelectorAll('.moul-grid')
			let photosSize: any = []
			photos.forEach((photo: any) => {
				let [w, h] = photo.getAttribute('data-size')?.split(':') as any
				let { width, height } = getDimension(+w, +h, 2048, 2048)

				photosSize.push({ width, height })
			})
			let idealElementHeight = 380
			let containerWidth =
				document.body.clientWidth > 2000 && photosSize.length < 4
					? 1800
					: document.body.clientWidth
			let layout = fixed_partition(photosSize, {
				containerWidth,
				idealElementHeight,
				spacing: 16,
			})
			el.classList.add('is-grid')
			el.style.width = `${layout.width}px`
			el.style.height = `${layout.height}px`

			layout.positions.forEach((_: any, i: number) => {
				photos[i].style.position = `absolute`
				photos[i].style.top = `${layout.positions[i].y}px`
				photos[i].style.left = `${layout.positions[i].x}px`
				photos[i].style.width = `${layout.positions[i].width}px`
				photos[i].style.height = `${layout.positions[i].height}px`
			})
		})
		console.timeEnd('grid')
	}

	return (
		<>
			{status === 'not_found' && <div>Not found!</div>}

			{status === 'ok' && (
				<>
					<div className="">
						<div className="moul-cover w-full h-[350px] md:h-[450px] lg:h-[550px] xl:h-[650px] relative">
							<Link
								to={`photo/${story?.cover?.hash}`}
								key={story?.cover?.hash}
								className=""
							>
								<picture className="absolute top-0 left-0 w-full h-full">
									<img
										src={`data:image/jpeg;charset=utf-8;base64,${story?.cover?.bh}`}
										data-srcset={getPhotoSrcSet(story?.cover)}
										data-sizes="auto"
										className="lazy w-full h-full object-cover"
										alt="Story cover"
									/>
								</picture>
							</Link>
						</div>
						<Profile profile={story.profile} />
						<div className="moul-content-title mx-auto font-bold max-w-3xl mb-6 text-neutral-50 px-6 xs:px-0">
							<h1 className="text-5xl">{story?.title}</h1>
						</div>
					</div>
					<div className="mx-auto"></div>

					<footer className="flex flex-col w-full text-center my-16 text-neutral-400">
						{story?.profile.name && (
							<p>Copyright © {story.profile.name}. All Rights Reserved.</p>
						)}
					</footer>
				</>
			)}
		</>
	)
}
