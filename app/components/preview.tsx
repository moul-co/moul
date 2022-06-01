import { Link, useLoaderData } from '@remix-run/react'
import { fixed_partition } from 'image-layout'
import { useEffect } from 'react'

import { Cover, Profile, Stories } from '~/components/story'
import { Photo } from '~/types'
import { getDimension, getPhotoSrcSet, isBrowser } from '~/utilities'

type PreviewProps = {
	content: any
	profile: any
	stories?: any
}

export default function Preview({ content, profile, stories }: PreviewProps) {
	const { photos, slug } = useLoaderData()
	const title = content && content.children.find((c: any) => c.name === 'title')
	const coverExist =
		content && content.children.find((c: any) => c.name === 'cover')
	const cover =
		photos &&
		photos.find((p: Photo) => p.pid === coverExist?.children[0].attributes.pid)

	useEffect(() => {
		paintGrid()

		if (isBrowser()) {
			document.querySelector('main')?.addEventListener('resize', paintGrid)
		}
		return () => {
			document.querySelector('main')?.removeEventListener('resize', paintGrid)
		}
	}, [content])

	const paintGrid = () => {
		console.log('pain grid...')
		const grid = document.querySelectorAll('.moul-content-grid')
		grid.forEach((el: any) => {
			const photos = el.querySelectorAll('.moul-grid')
			const photosSize: any = []
			photos.forEach((photo: any) => {
				const [w, h] = photo.getAttribute('data-size')?.split(':') as any
				const { width, height } = getDimension(+w, +h, 2048, 2048)

				photosSize.push({ width, height })
			})
			const viewportWidth = document.querySelector('main')?.clientWidth!
			const idealElementHeight =
				viewportWidth && photosSize.length < 2
					? 500
					: viewportWidth < 800
					? 280
					: 360
			const containerWidth =
				viewportWidth > 2000 && photosSize.length <= 2
					? 800
					: viewportWidth > 2000 && photosSize.length < 4
					? 1800
					: viewportWidth > 3000
					? 2400
					: viewportWidth
			const layout = fixed_partition(photosSize, {
				containerWidth,
				idealElementHeight,
				spacing: 16,
			})
			el.classList.add('is-grid')
			el.style.width = `auto`
			el.style.height = `${layout.height}px`

			layout.positions.forEach((_: any, i: number) => {
				photos[i].style.position = `absolute`
				photos[i].style.top = `${layout.positions[i].y}px`
				photos[i].style.left = `${layout.positions[i].x}px`
				photos[i].style.width = `${layout.positions[i].width}px`
				photos[i].style.height = `${layout.positions[i].height}px`
				photos[i].querySelector(
					'img'
				).style.width = `${layout.positions[i].width}px`
				photos[i].querySelector(
					'img'
				).style.height = `${layout.positions[i].height}px`
			})
		})
	}

	return (
		<>
			{!slug && (
				<div className="relative w-full h-96">
					<Cover photo={profile.cover} />
				</div>
			)}
			{slug && cover && (
				<div className="relative w-full h-96">
					<Cover photo={cover} />
				</div>
			)}

			<Profile profile={profile} basePath="/_moul/" />
			{content && (
				<>
					{title && (
						<div className="moul-content-title mx-auto font-bold max-w-3xl mb-6 text-neutral-900 dark:text-neutral-50 px-6 xs:px-0">
							<h1 className="text-3xl md:text-5xl">
								{title?.children[0]?.children[0]}
							</h1>
						</div>
					)}
					{content.children.map((c: any, i: number) => (
						<div className={`mx-auto moul-content-${c.name}`} key={i}>
							{c.name === 'p' && (
								<p className="px-6 xs:px-0 text-lg md:text-xl max-w-3xl mx-auto my-8 md:my-10 text-neutral-700 dark:text-neutral-200">
									{c?.children[0]}
								</p>
							)}
							{c.name === 'h1' && (
								<h2 className="px-6 xs:px-0 text-2xl md:text-3xl font-bold sm:text-4xl max-w-3xl mx-auto my-8 md:my-10 text-neutral-800 dark:text-neutral-100">
									{c?.children[0]}
								</h2>
							)}
							{c.name === 'h2' && (
								<h3 className="px-6 xs:px-0 text-xl md:text-2xl font-bold sm:text-3xl max-w-3xl mx-auto my-8 md:my-10 text-neutral-800 dark:text-neutral-100">
									{c?.children[0]}
								</h3>
							)}
							{c.name === 'h3' && (
								<h4 className="px-6 xs:px-0 text-xl md:text-xl font-bold sm:text-2xl max-w-3xl mx-auto my-8 md:my-10 text-neutral-800 dark:text-neutral-100">
									{c?.children[0]}
								</h4>
							)}
							{c.name === 'blockquote' && (
								<blockquote className="px-6 xs:px-0 text-lg md:text-xl max-w-3xl mx-auto my-8 md:my-10 text-neutral-800 border-neutral-800 dark:text-neutral-400 dark:border-neutral-400 border-l-4 pl-4">
									{c?.children[0]?.children[0]}
								</blockquote>
							)}
							{c.name === 'grid' && (
								<div className="relative mx-auto">
									{c.children.map((c: any, i: number) => {
										const photo = photos?.find(
											(p: Photo) => p.pid === c.attributes.pid
										)
										return (
											<picture
												key={i}
												className={`moul-grid`}
												data-size={`${photo?.width}:${photo?.height}`}
											>
												<img
													className="lazy"
													src={`data:image/jpeg;charset=utf-8;base64,${photo?.blurhash}`}
													data-sizes="auto"
													data-srcset={getPhotoSrcSet(photo)}
												/>
											</picture>
										)
									})}
								</div>
							)}
						</div>
					))}
				</>
			)}
			{stories && <Stories stories={stories} basePath="/_moul/" />}

			<footer className="flex flex-col w-full text-center px-6 my-16 text-neutral-500 dark:text-neutral-400">
				{profile?.name && (
					<p>Copyright © {profile?.name}. All Rights Reserved.</p>
				)}
			</footer>
		</>
	)
}
