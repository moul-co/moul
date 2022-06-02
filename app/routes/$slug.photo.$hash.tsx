import {
	json,
	LoaderFunction,
	HeadersFunction,
	MetaFunction,
} from '@remix-run/cloudflare'
import { Link, useLoaderData, useNavigate } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import {
	getDimension,
	isBrowser,
	getPhotoSrcSet,
	getPhotoSrc,
} from '~/utilities'
import { Photo } from '~/types'

export const loader: LoaderFunction = async ({ request, params }) => {
	const { slug, hash } = params
	const profile = await MOUL_KV.get('profile', { type: 'json' })
	const story = (await MOUL_KV.get(`story-${slug}`, { type: 'json' })) as any
	if (!story) {
		return new Response('not_found', { status: 404 })
	}
	story.title = story.children.find((c: any) => c.name === 'title')
	const currentPhoto = story.photos?.find((p: Photo) => p?.pid === hash)
	const title = story.title.children[0]?.children[0]

	return json(
		{
			currentPhoto,
			photos: story.photos.filter((p: any) => p),
			slug,
			story,
			title,
			canonical: request.url,
			profile,
		},
		{
			headers: { Link: request.url },
		}
	)
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
	const cacheControl = loaderHeaders.get('Link')?.includes('localhost:')
		? 'public, max-age=0, must-revalidate'
		: 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=31540000000'
	// 1 day, 30 days, 1 year
	return {
		Link: `${loaderHeaders.get('Link')}; rel="canonical"`,
		'Cache-Control': cacheControl,
	}
}

export const meta: MetaFunction = ({ data }) => {
	if (data.data == 'not_found') return {}
	const { name, bio, twitter } = data.profile
	const { title: t, currentPhoto } = data
	const title = t ? `${t} | ${name}` : name
	const url = new URL(data.canonical)
	const imgURL = `${url.protocol}//${url.host}${getPhotoSrc(currentPhoto)}`

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
// https://codesandbox.io/s/framer-motion-image-gallery-pqvx3?from-embed=&file=/src/Example.tsx
const swipeConfidenceThreshold = 10000
const swipePower = (offset: number, velocity: number) => {
	return Math.abs(offset) * velocity
}

export default function Photo() {
	const { currentPhoto, photos, slug, data } = useLoaderData()
	const navigation = useNavigate()

	const [photo, setPhoto] = useState(currentPhoto?.pid)

	const [hash, setHash] = useState(currentPhoto?.blurhash)
	const [width, setWidth] = useState(0)
	const [height, setHeight] = useState(0)

	const [currentIndex, setCurrentIndex] = useState(0)
	const [next, setNext] = useState('')
	const [prev, setPrev] = useState('')

	const [wrapper, setWrapper] = useState(0)
	const [currentWidth, setCurrentWidth] = useState(0)
	const [open, setOpen] = useState(false)
	const [index, setIndex] = useState(0)
	const [ui, setUi] = useState(true)
	const [showExif, setShowExif] = useState(false)
	const [active, setActive] = useState('translateX(0)')
	const [transition, setTransition] = useState('none')

	useEffect(() => {
		if (data === 'not_found') return

		if (isBrowser()) {
			paintPhotos()
		}

		setCurrentIndex(photos.findIndex((p: any) => p.pid === photo))
		if (photos.length === 1) {
			setNext('')
			setPrev('')
		} else if (currentIndex > 0 && currentIndex < photos.length - 1) {
			setNext(photos[currentIndex + 1].pid)
			setPrev(photos[currentIndex - 1].pid)
		} else if (currentIndex === photos.length - 1) {
			setNext('')
			setPrev(photos[currentIndex - 1].pid)
		} else if (currentIndex === 0 && photo.length > 1) {
			setPrev('')
			setNext(photos[currentIndex + 1].pid)
		}
		if (isBrowser()) {
			window.addEventListener('resize', paintPhotos)
			window.addEventListener('popstate', handlePopstate)
			window.addEventListener('keyup', handleKeyup)
		}

		return () => {
			window.removeEventListener('popstate', handlePopstate)
			window.removeEventListener('resize', paintPhotos)
			window.removeEventListener('keyup', handleKeyup)
		}
	}, [
		photo,
		photos,
		currentIndex,
		next,
		prev,
		width,
		height,
		wrapper,
		currentWidth,
		ui,
		active,
		transition,
	])

	const handlePopstate = () => {
		const pn = location.pathname.split('/')
		if (pn.length) {
			const isPhoto = pn[pn.length - 2] == 'photo'
			if (isPhoto) {
				const pIdx = photos.findIndex((p: any) => p.pid === pn[pn.length - 1])
				setPhoto(photos[pIdx].pid)
				setHash(photos[pIdx].blurhash)
			}
		}
	}

	const paintPhotos = () => {
		const { width, height } = getDimension(
			currentPhoto.width,
			currentPhoto.height,
			window.innerWidth,
			window.innerHeight
		)
		setWidth(width)
		setHeight(height)

		setCurrentWidth(window.innerWidth)
		setWrapper(photos.length * window.innerWidth)

		const activeIndex = photos?.findIndex((p: any) => p.pid === photo)
		// @ts-ignore
		setActive(`translateX(-${currentWidth * activeIndex}px)`)

		const photosList = document.querySelectorAll(
			'.moul-darkbox-list picture img'
		) as any
		photosList.forEach((img: any) => {
			const [w, h] = img.getAttribute('data-size').split(':')
			const { width, height } = getDimension(
				w,
				h,
				window.innerWidth,
				window.innerHeight
			)
			img.style.width = `${width}px`
			img.style.height = `${height}px`
		})
	}

	const handleKeyup = (event: any) => {
		if (event.key === 'ArrowRight') {
			handleNext()
		}
		if (event.key === 'ArrowLeft') {
			handlePrev()
		}
		if (event.key === 'Escape') {
			navigation('/' + slug)
		}
	}

	const handleNext = () => {
		if (!next) return
		setTransition('all var(--transition-photos)')
		const photoIndex = currentIndex + 1
		setPhoto(photos[photoIndex].pid)
		setHash(photos[photoIndex].blurhash)

		navigation(`/${slug}/photo/${next}`)
	}

	const handlePrev = () => {
		if (!prev) return
		setTransition('all var(--transition-photos)')
		const photoIndex = currentIndex - 1
		setPhoto(photos[photoIndex].pid)
		setHash(photos[photoIndex].blurhash)

		navigation(`/${slug}/photo/${prev}`)
	}

	const toggleUI = () => {
		setUi(!ui)
	}

	const toggleExif = () => {
		setShowExif(!showExif)
	}

	const handleUiClick = (event: any) => {
		if (event.target.className === 'moul-darkbox-list') {
			navigation('/' + slug)
		}
	}

	const ShowExifData = ({ type, value }: any) => {
		return (
			<div className="flex h-6 mr-2">
				<span className="text-right bg-neutral-400/80 text-neutral-900 py-0.5 px-2 rounded-tl-full rounded-bl-full">
					{type}
				</span>
				<span className="bg-neutral-400 font-bold text-neutral-900 py-0.5 px-2 rounded-tr-full rounded-br-full">
					{value}
				</span>
			</div>
		)
	}

	const {
		cameraMake,
		cameraModel,
		lens,
		focalLength,
		aperture,
		shutterSpeed,
		iso,
	} = photos[currentIndex]?.metadata || {}

	return (
		<>
			{data == 'not_found' ? (
				<>not found</>
			) : (
				<div className="moul-darkbox-photo">
					{ui && (
						<>
							{prev && (
								<button
									className="moul-darkbox-btn fixed z-30 border-0 p-0 bg-neutral-100/50 hover:bg-neutral-100 dark:bg-black/20 dark:hover:bg-black/60 transition-colors is-prev left-4 rounded-full"
									onClick={handlePrev}
								>
									<svg
										fill="currentColor"
										viewBox="0 0 16 16"
										className="w-9 h-9 rounded-full p-1"
									>
										<path
											fillRule="evenodd"
											d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"
										/>
									</svg>
								</button>
							)}
							{next && (
								<button
									className="moul-darkbox-btn fixed z-30 border-0 p-0 bg-neutral-100/50 hover:bg-neutral-100 dark:bg-black/20 dark:hover:bg-black/60 transition-colors is-next right-4 rounded-full"
									onClick={handleNext}
								>
									<svg
										fill="currentColor"
										viewBox="0 0 16 16"
										className="w-9 h-9 rounded-full p-1"
									>
										<path
											fillRule="evenodd"
											d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"
										/>
									</svg>
								</button>
							)}
							<Link
								to={'/' + slug}
								className="moul-darkbox-btn fixed z-50 border-0 p-0 bg-neutral-100/50 hover:bg-neutral-100 dark:bg-black/20 dark:hover:bg-black/60 transition-colors top-4 left-4 is-close rounded-full"
							>
								<svg
									fill="currentColor"
									viewBox="0 0 16 16"
									className="w-9 h-9 rounded-full p-1"
								>
									<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
								</svg>
							</Link>
							<button
								onClick={toggleExif}
								className="moul-darkbox-btn fixed top-4 right-4 p-0 border-0 bg-neutral-100/50 hover:bg-neutral-100 dark:bg-black/20 dark:hover:bg-black/60 transition-colors rounded-full z-50"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									fill="currentColor"
									viewBox="0 0 16 16"
									className="w-9 h-9 p-1.5"
								>
									<path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1v6zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2z" />
									<path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" />
								</svg>
							</button>
							{showExif && (
								<div className="bg-black/75 absolute inset-0 py-4 flex text-sm justify-center items-center h-16 z-30">
									{cameraMake && (
										<ShowExifData type="Make" value={cameraMake} />
									)}
									{cameraModel && (
										<ShowExifData type="Model" value={cameraModel} />
									)}
									{lens && <ShowExifData type="Lens" value={lens} />}
									{focalLength && (
										<ShowExifData
											type="Focal Length"
											value={`${focalLength[0] / focalLength[1]}mm`}
										/>
									)}
									{aperture && (
										<ShowExifData
											type="Aperture"
											value={
												<>
													<em>f</em>/{aperture[0] / aperture[1]}
												</>
											}
										/>
									)}
									{shutterSpeed && (
										<ShowExifData
											type="Shutter Speed"
											value={
												shutterSpeed[0] / 10 > 1
													? `${shutterSpeed[0] / 10}s`
													: `${shutterSpeed[0] / 10}/${shutterSpeed[1] / 10}s`
											}
										/>
									)}
									{iso && <ShowExifData type="ISO" value={iso} />}
								</div>
							)}
						</>
					)}
					<div className="moul-darkbox fixed top-0 bottom-0 left-0 right-0 z-10 transition opacity-100">
						<div className="moul-darkbox-wrap overflow-hidden h-screen">
							<div
								className="moul-darkbox-view relative mx-auto z-20 overflow-hidden"
								onClick={handleUiClick}
							>
								{/* this element is the full width of photos combine!  */}
								<div
									style={{
										transition: `${transition}`,
										transform: `${active}`,
										width: `${wrapper}px`,
									}}
								>
									{/* this element is the current active photo! */}
									<div style={{ width: `${currentWidth}px` }}>
										<div className="moul-darkbox-inner flex h-screen">
											{/* from here is the actual photo wrap with `min-width` */}
											<AnimatePresence initial={false}>
												{photos?.map((p: Photo) => (
													<div
														key={p?.pid}
														className="moul-darkbox-list flex justify-center items-center"
														style={{
															minWidth: `${currentWidth}px`,
														}}
													>
														<picture>
															<motion.img
																src={`data:image/jpeg;charset=utf-8;base64,${p?.blurhash}`}
																className="lazy"
																data-sizes="auto"
																data-srcset={getPhotoSrcSet(p)}
																onClick={toggleUI}
																data-size={`${p?.width}:${p?.height}`}
																drag="x"
																dragConstraints={{
																	left: 0,
																	right: 0,
																}}
																dragElastic={0}
																onDragEnd={(e, { offset, velocity }) => {
																	const swipe = swipePower(offset.x, velocity.x)
																	if (swipe < -swipeConfidenceThreshold) {
																		handleNext()
																	} else if (swipe > swipeConfidenceThreshold) {
																		handlePrev()
																	}
																}}
																alt={p?.name}
															/>
														</picture>
													</div>
												))}
											</AnimatePresence>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	)
}
