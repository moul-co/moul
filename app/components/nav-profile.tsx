import { Fragment, useEffect, useRef, useState } from 'react'
import { Form } from '@remix-run/react'
import { Dialog, Transition } from '@headlessui/react'
import clsx from 'clsx'
import { get, set } from 'idb-keyval'

import Icon from '~/components/icon'
import { Photo, PhotoMetadata, Profile } from '~/types'
import {
	getPhotoURL,
	parseExif,
	processPhoto,
	processPhotoWithSize,
} from '~/utilities'
import { Tooltip } from './tooltips'
import { encode } from 'blurhash'

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
	const [isProcessing, setIsProcessing] = useState(false)
	const coverRef = useRef() as any
	const photoRef = useRef() as any
	const profileRef = useRef() as any

	useEffect(() => {})

	function handleAdd(type: string) {
		type === 'cover' && coverRef.current.click()
		type === 'picture' && photoRef.current.click()
	}

	async function closeModal() {
		setIsOpen(false)
	}

	async function openModal() {
		// const photos = await get('photos')
		// if (photos) {
		// 	photos.forEach((p: any) => console.log(URL.createObjectURL(p)))
		// }
		setIsOpen(true)
	}

	function handleChange(event: any) {
		for (const file of event.target.files) {
			const reader = new FileReader()
			reader.onload = async (e: any) => {
				const photos = (await get('photos')) || []
				const result = await fetch(`${e.target.result}`)
				const blob = await result.blob()
				await set('photos', [...photos, blob])
			}
			reader.readAsDataURL(file)
		}
	}

	function readFileAsync(file: any) {
		return new Promise((resolve) => {
			let fileReader = new FileReader()
			fileReader.onload = () => {
				resolve(fileReader.result)
			}
			fileReader.readAsDataURL(file)
		})
	}

	async function handleChangeProfile(event: any) {
		const image = await readFileAsync(event.target.files[0])
		const result = await fetch(`${image}`)
		const blob = await result.blob()
		const url = URL.createObjectURL(blob)
		console.log(url)
		const metadata = await parseExif(result.url)
		let photo: Photo = {
			pid: '',
			order: 0,
			blurhash: '',
			width: 0,
			height: 0,
			type: 'profile-picture',
			url,
			metadata,
			contentType: result.headers.get('content-type') || 'image/jpeg',
		}
		setPicture(photo)
		console.log('load from buffer...')
		console.time('loadImage')
		const buffer = await fetch(`${image}`).then((resp) => resp.arrayBuffer())
		console.timeEnd('loadImage')
		console.time('resizeImage')
		let im = vips.Image.thumbnailBuffer(buffer, 16)
		console.timeEnd('resizeImage')
		// const md = im.thumbnail(2560)
		console.time('encodingImage')
		const outBuffer = new Uint8Array(im.writeToBuffer('.jpg'))
		// const newBlob = new Blob([outBuffer], { type: 'image/jpeg' })
		console.time('hashing')
		const blurhash = moulBlurhash(outBuffer)
		console.timeEnd('hashing')
		console.log(blurhash)
	}

	async function handleSubmit(event: any) {
		event.preventDefault()
		profileRef.current.submit()
		// new profile picture or cover

		// if (picture?.url  && !picture?.blurhash) {
		// const profilePicture = await get('profile-picture')
		// console.log(profilePicture)
		// const { base64 } = await processPhotoWithSize(profilePicture, 'xl') as any
		// const { width, height, blurhash } = await processPhoto(profilePicture) as any
		// console.log(width, height, blurhash, base64)
		// console.log({profilePicturePhoto})
		// photo.width = +width
		// photo.height = +height
		// photo.blurhash = blurhash
		// console.log(width, height)
		// await fetch(`/moul/r2/${pid}/original`, {
		// 	method: 'PUT',
		// 	headers: {
		// 		'Content-Type': file.type,
		// 	},
		// 	body: file
		// })
		// }
		profileRef.current.reset()
		// closeModal()
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
						<div className="fixed inset-0 bg-black bg-opacity-80" />
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
												isProcessing &&
													'opacity-50 cursor-not-allowed hover:ring-0'
											)}
											type="submit"
											form="profileForm"
											onClick={handleSubmit}
										>
											Save
										</button>
									</Dialog.Title>
									<Dialog.Description
										as="main"
										className="h-[600px] max-h-[80vh] overflow-y-auto"
									>
										<div className="mb-2">
											<div
												onClick={() => handleAdd('cover')}
												className="relative mx-auto my-4 w-auto h-44 border-2 border-dashed transition text-neutral-600 hover:text-neutral-200 border-neutral-600 hover:border-neutral-200 hover:cursor-pointer flex items-center justify-center"
											>
												<span className="text-xl font-bold">Cover</span>
												<input
													type="file"
													onChange={handleChange}
													name="photo"
													className="hidden"
													ref={photoRef}
													multiple
													accept=".jpeg,.jpg"
												/>
											</div>
											<div
												onClick={() => !isProcessing && handleAdd('picture')}
												className={clsx(
													'relative mx-auto my-5 w-28 h-28 transition text-neutral-600 hover:text-neutral-200 border-neutral-600 hover:border-neutral-200 rounded-full flex items-center justify-center',
													!picture && 'border-2 border-dashed',
													!isProcessing && 'hover:cursor-pointer'
												)}
											>
												{picture ? (
													<>
														<picture className="absolute top-0 left-0 w-full h-full rounded-full">
															{isProcessing && (
																<span className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-neutral-50 bg-opacity-50 rounded-full">
																	<Icon
																		name="cloud-upload-fill"
																		className="w-10 h-10 text-neutral-900 animate-pulse"
																	/>
																</span>
															)}
															<img
																src={getPhotoURL(picture)}
																alt=""
																className="rounded-full w-full h-full"
															/>
														</picture>
													</>
												) : (
													<span className="text-lg font-bold">Picture</span>
												)}
												<input
													type="file"
													onChange={handleChangeProfile}
													name="photo"
													className="hidden"
													ref={photoRef}
													multiple
													accept=".jpeg,.jpg"
												/>
											</div>
											<section className="px-4">
												<Form method="post" id="profileForm" ref={profileRef}>
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
															defaultValue={github}
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
															defaultValue={twitter}
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
															defaultValue={youtube}
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
															defaultValue={instagram}
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
															defaultValue={facebook}
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
