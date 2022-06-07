import { Fragment, useEffect, useRef, useState } from 'react'
import {
	Form,
	useFetcher,
	useLoaderData,
	useNavigate,
	useParams,
	useTransition,
} from '@remix-run/react'
import { Dialog, Transition } from '@headlessui/react'
import clsx from 'clsx'
import { get, set } from 'idb-keyval'

import Icon from '~/components/icon'
import { Photo, PhotoMetadata, Profile } from '~/types'
import {
	getPhotoSrcSet,
	getPhotoURL,
	nanoid,
	parseExif,
	readFileAsync,
} from '~/utilities'
import { Tooltip } from './tooltip'

export default function NavProfile({ profile }: { profile: Profile }) {
	const [name, setName] = useState(profile?.name)
	const [bio, setBio] = useState(profile?.bio)
	const [github, setGithub] = useState(profile?.github)
	const [twitter, setTwitter] = useState(profile?.twitter)
	const [youtube, setYoutube] = useState(profile?.youtube)
	const [instagram, setInstagram] = useState(profile?.instagram)
	const [facebook, setFacebook] = useState(profile?.facebook)
	const [picture, setPicture] = useState(profile?.picture)
	const [cover, setCover] = useState(profile?.cover)

	const [isOpen, setIsOpen] = useState(false)
	const [isProcessingCover, setIsProcessingCover] = useState(false)
	const [isProcessingPicture, setIsProcessingPicture] = useState(false)
	const coverRef = useRef() as any
	const pictureRef = useRef() as any
	const profileFormRef = useRef() as any
	const inputProfileCover = useRef() as any
	const transition = useTransition()
	const navigation = useNavigate()
	const fetcher = useFetcher()
	const { slug } = useParams()

	useEffect(() => {})

	function handleAdd(type: string) {
		type === 'cover' && coverRef.current.click()
		type === 'picture' && pictureRef.current.click()
	}

	async function closeModal() {
		setIsOpen(false)
	}

	async function openModal() {
		setIsOpen(true)
	}

	async function handleSubmit(e: any) {
		e.preventDefault()
		let body = JSON.stringify(
			Object.fromEntries(new FormData(profileFormRef.current))
		)
		profileFormRef.current.reset()
		const resp = await fetch(`/_moul/kv?prefix=profile`, {
			method: 'POST',
			body,
		})
		if (!resp.ok) {
			console.error('log error')
		}
		closeModal()
		// navigation('/_moul', { replace: true })
		//!fixme: handle this properly
		window.location = window.location
	}

	async function handleChangePhoto(event: any) {
		const prefix = event.target.name
		const isProfilePicture = prefix === 'profile-picture'
		isProfilePicture ? setIsProcessingPicture(true) : setIsProcessingCover(true)
		const file = event.target.files[0]
		const image = await readFileAsync(file)
		const result = await fetch(`${image}`)
		const blob = await result.blob()
		const metadata = await parseExif(result.url)
		const url = URL.createObjectURL(blob)
		const el = document.getElementById(`img-${prefix}`)
		el?.setAttribute('src', url)
		el?.setAttribute('data-srcset', url)
		el?.setAttribute('srcset', url)

		const buffer = await fetch(`${image}`).then((resp) => resp.arrayBuffer())
		const original = vips.Image.jpegloadBuffer(buffer, { autorotate: true })
		const { width, height } = original
		original.delete()
		const photo: Photo = {
			name: file.name,
			pid: nanoid(),
			order: 0,
			blurhash: '',
			width,
			height,
			prefix,
			url,
			metadata,
			contentType: result.headers.get('content-type') || 'image/jpeg',
		}
		const img = vips.Image.thumbnailBuffer(buffer, 16, {
			no_rotate: false,
		})
		const outBuffer = img.writeToBuffer('.jpg')
		img.delete()
		photo.blurhash = moulBlurhash(outBuffer)

		// this 2 sizes work for now!
		// later we can even support different type of format,
		// base on users accept headers, webp? avif?
		let sizes = { xl: 3840, md: 1920 }
		if (isProcessingPicture) sizes = { xl: 1024, md: 512 }

		for (let [k, v] of Object.entries(sizes)) {
			const img = vips.Image.thumbnailBuffer(buffer, v, {
				no_rotate: false,
			})
			const out = img.writeToBuffer('.jpg')
			img.delete()
			const body = new Blob([out], { type: 'image/jpeg' })
			await fetch(`/_moul/r2/${prefix}/${photo.pid}/${k}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'image/jpeg',
				},
				body,
			})
		}

		await fetch(`/_moul/kv?prefix=${prefix}`, {
			method: 'POST',
			body: JSON.stringify(photo),
		})

		fetcher.load(`/_moul${slug ? '/' + slug : ''}`)

		isProfilePicture
			? setIsProcessingPicture(false)
			: setIsProcessingCover(false)
	}

	return (
		<>
			<button
				type="button"
				onClick={openModal}
				className="flex items-center mr-2 py-1 px-2 rounded transition hover:bg-neutral-800 text-neutral-500 hover:text-neutral-200"
			>
				<Icon name="person-fill" className="mr-2" />
				<span className="relative">
					Profile
					{/* {isProcessing && (
						<Tooltip label="proccessing..." placement='right'>
							<span className='w-2.5 h-2.5 rounded-full bg-red-500 top-0 -right-2 absolute after:w-2.5 after:h-2.5 after:rounded-full after:bg-red-500 after:top-0 after:right-0 after:absolute after:animate-ping'></span>
						</Tooltip>
					)} */}
				</span>
			</button>
			<Transition appear show={isOpen} as={Fragment}>
				<Dialog as="div" className="relative z-50" onClose={closeModal}>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-black" />
					</Transition.Child>

					<div className="fixed inset-0">
						<div className="flex min-h-full items-center justify-center text-center">
							<Transition.Child
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0 scale-95"
								enterTo="opacity-100 scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 scale-100"
								leaveTo="opacity-0 scale-95"
							>
								<Dialog.Panel className="w-full max-w-lg transform rounded-2xl dark:bg-neutral-800 text-left align-middle shadow-xl transition-all">
									<Dialog.Title
										as="section"
										className="sticky top-0 py-2.5 flex items-center justify-between"
									>
										<button
											className="button--icon mr-4 ml-2"
											onClick={closeModal}
										>
											<Icon name="x" />
										</button>
										<h3 className="text-2xl font-bold leading-normal text-neutral-200 mr-auto">
											Profile
										</h3>
										<button
											className={clsx(
												'button w-auto py-2.5 font-normal mr-4',
												(isProcessingPicture || isProcessingPicture) &&
													'opacity-50 cursor-not-allowed hover:ring-0'
											)}
											type="submit"
											form="profileForm"
											onClick={handleSubmit}
										>
											{transition.state === 'submitting' ? 'Saving...' : 'Save'}
										</button>
									</Dialog.Title>
									<Dialog.Description
										as="main"
										className="h-[600px] max-h-[80vh] overflow-y-auto"
									>
										<div className="mb-2">
											<div
												onClick={() => handleAdd('cover')}
												className="relative mx-auto my-4 w-auto h-44 border-2 border-dashed transition bg-neutral-700 text-neutral-600 hover:text-neutral-200 border-neutral-600 hover:border-neutral-200 hover:cursor-pointer flex items-center justify-center"
											>
												<picture className="absolute top-0 left-0 w-full h-full">
													{isProcessingCover && (
														<span className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-neutral-50 bg-opacity-50">
															<Icon
																name="cloud-upload-fill"
																className="w-10 h-10 text-neutral-900 animate-pulse"
															/>
														</span>
													)}
													<img
														id="img-profile-cover"
														src={
															cover?.url
																? cover.url
																: cover?.blurhash
																? `data:image/jpeg;base64,${cover.blurhash}`
																: `data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNU+w8AAVEBJyqFqRcAAAAASUVORK5CYII=`
														}
														data-srcset={getPhotoSrcSet(cover!)}
														data-sizes="auto"
														alt={cover?.name}
														className={clsx(
															'w-full h-full object-cover',
															cover && 'lazy'
														)}
													/>
												</picture>
												<input
													type="file"
													onChange={handleChangePhoto}
													name="profile-cover"
													className="hidden"
													ref={coverRef}
													multiple
													accept=".jpeg,.jpg"
												/>
											</div>
											<div
												onClick={() =>
													!isProcessingPicture && handleAdd('picture')
												}
												className={clsx(
													'relative mx-auto my-5 w-28 h-28 transition border-2 border-dashed bg-neutral-700 text-neutral-600 hover:text-neutral-200 border-neutral-600 hover:border-neutral-200 rounded-full flex items-center justify-center',
													!picture && 'border-2 border-dashed',
													!isProcessingPicture && 'hover:cursor-pointer'
												)}
											>
												<picture className="absolute top-0 left-0">
													{isProcessingPicture && (
														<span className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-neutral-50 bg-opacity-50 rounded-full">
															<Icon
																name="cloud-upload-fill"
																className="w-10 h-10 text-neutral-900 animate-pulse"
															/>
														</span>
													)}
													<img
														id="img-profile-picture"
														src={
															picture?.url
																? picture.url
																: picture?.blurhash
																? `data:image/jpeg;base64,${picture.blurhash}`
																: `data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNU+w8AAVEBJyqFqRcAAAAASUVORK5CYII=`
														}
														data-srcset={getPhotoSrcSet(picture!)}
														data-sizes="auto"
														alt={picture?.name}
														className={clsx(
															'rounded-full w-full h-full object-cover',
															picture && 'lazy'
														)}
													/>
												</picture>
												<input
													type="file"
													onChange={handleChangePhoto}
													name="profile-picture"
													className="hidden"
													ref={pictureRef}
													multiple
													accept=".jpeg,.jpg"
												/>
											</div>
											<section className="px-4">
												<Form
													method="post"
													id="profileForm"
													ref={profileFormRef}
												>
													<div className="relative mb-5">
														<label htmlFor="name" className="label">
															Name
														</label>
														<input
															type="text"
															className="input"
															id="name"
															name="name"
															defaultValue={name}
														/>
													</div>
													<div className="relative mb-5">
														<label htmlFor="bio" className="label">
															Bio
														</label>
														<textarea
															name="bio"
															id="bio"
															rows={6}
															className="input h-24"
															defaultValue={[bio]}
														></textarea>
													</div>

													<div className="relative mb-5">
														<label
															htmlFor="github"
															className="label flex items-center"
														>
															<span className="mr-2">
																<Icon name="github" />
															</span>
															GitHub
														</label>
														<input
															type="text"
															className="input"
															id="github"
															name="github"
															defaultValue={profile.github}
														/>
													</div>
													<div className="relative mb-5">
														<label
															htmlFor="twitter"
															className="label flex items-center"
														>
															<span className="mr-2">
																<Icon name="twitter" />
															</span>
															Twitter
														</label>
														<input
															type="text"
															className="input"
															id="twitter"
															name="twitter"
															defaultValue={profile.twitter}
														/>
													</div>
													<div className="relative mb-5">
														<label
															htmlFor="youtube"
															className="label flex items-center"
														>
															<span className="mr-2">
																<Icon name="youtube" />
															</span>
															YouTube
														</label>
														<input
															type="text"
															className="input"
															id="youtube"
															name="youtube"
															defaultValue={profile.youtube}
														/>
													</div>
													<div className="relative mb-5">
														<label
															htmlFor="instagram"
															className="label flex items-center"
														>
															<span className="mr-2">
																<Icon name="instagram" />
															</span>
															Instagram
														</label>
														<input
															type="text"
															className="input"
															id="instagram"
															name="instagram"
															defaultValue={profile.instagram}
														/>
													</div>
													<div className="relative mb-5">
														<label
															htmlFor="facebook"
															className="label flex items-center"
														>
															<span className="mr-2">
																<Icon name="facebook" />
															</span>
															Facebook
														</label>
														<input
															type="text"
															className="input"
															id="facebook"
															name="facebook"
															defaultValue={profile.facebook}
														/>
													</div>
												</Form>
											</section>
										</div>
									</Dialog.Description>
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition>
		</>
	)
}
