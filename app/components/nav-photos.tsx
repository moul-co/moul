import { useFetcher, useLoaderData, useParams } from '@remix-run/react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition, RadioGroup } from '@headlessui/react'
import { get, set } from 'idb-keyval'

import Icon from '~/components/icon'
import { Tooltip } from '~/components/tooltip'
import {
	getPhotoSrcSet,
	nanoid,
	parseExif,
	readFileAsync,
	toastSuccess,
} from '~/utilities'
import { Photo } from '~/types'
import clsx from 'clsx'

export default function NavPhotos() {
	let [isOpen, setIsOpen] = useState(false)
	const photoRef = useRef() as any
	const loaderData = useLoaderData()
	const [data, setData] = useState(loaderData)
	const [processing, setProcessing] = useState(false)
	const { slug } = useParams()
	const fetcher = useFetcher()

	useEffect(() => {
		if (fetcher.data) {
			setData(fetcher.data)
		}
	}, [fetcher.data])

	function handleAdd() {
		photoRef.current.click()
	}

	async function closeModal() {
		setIsOpen(false)
	}

	async function openModal() {
		// let photos = await get('photos')
		// if (photos) {
		// 	photos.forEach((p: any) => console.log(URL.createObjectURL(p)))
		// }
		setIsOpen(true)
	}

	async function handleChange(event: any) {
		setProcessing(true)
		const prefix = event.target.name
		for (let f of event.target.files) {
			const image = await readFileAsync(f)
			const result = await fetch(`${image}`)
			const blob = await result.blob()
			const metadata = await parseExif(result.url)
			const url = URL.createObjectURL(blob)

			const buffer = await fetch(`${image}`).then((resp) => resp.arrayBuffer())
			const original = vips.Image.jpegloadBuffer(buffer, { autorotate: true })
			const { width, height } = original
			original.delete()
			const photo: Photo = {
				name: f.name,
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

			const sizes = { xl: 3840, md: 1920 }
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
			let params = slug
				? `?prefix=photo-${slug}-${photo.pid}`
				: `?prefix=photo-${photo.pid}`

			await fetch(`/_moul/kv${params}`, {
				method: 'POST',
				body: JSON.stringify(photo),
			})
		}
		fetcher.load(`/_moul/${slug}`)
		setProcessing(false)
	}

	const handleCopy = (pid: string) => {
		const pidInput = document.getElementById(`pid-${pid}`) as any
		pidInput.select()
		navigator.clipboard.writeText(pidInput.value)
		toastSuccess(`Copied successfully`)
	}

	// const confirmDelete = async (pid:string) => {
	// 	if (window.confirm('Do you really want to delete?')) {
	// 		let params = slug ? `?prefix=photo-${slug}-${pid}`
	// 			: `?prefix=photo-${pid}`
	// 		await fetch(`/_moul/kv${params}`, {
	// 			method: 'DELETE',
	// 		})
	// 		fetcher.load('/_moul')
	// 	}
	// }

	const ListPhotos = ({ photos }: any) => {
		let filtered = photos.filter((p: any) => !data?.storyMd?.includes(p.pid))
		return (
			<>
				{filtered &&
					filtered?.map((photo: Photo, i: number) => (
						<div className="w-2/6 h-48 relative" key={i}>
							<picture className="absolute top-0 left-0 w-full h-full">
								<img
									src={`data:image/jpeg;base64,${photo?.blurhash}`}
									data-srcset={getPhotoSrcSet(photo)}
									data-sizes="auto"
									alt={photo.name}
									className="lazy w-full h-full object-cover"
								/>
							</picture>
							<input type="hidden" value={photo.pid} id={'pid-' + photo.pid} />
							<div className="absolute bottom-0 w-full">
								<div className="relative z-20 flex justify-center bg-black bg-opacity-80">
									<Tooltip label="Copy `pid` to clipboard">
										<button
											className="button--icon h-9 hover:bg-blue-600 mr-2"
											onClick={() => handleCopy(photo.pid)}
										>
											<Icon name="clipboard" className="" />
										</button>
									</Tooltip>
									{/* <Tooltip label="Delete photo">
																	<button
																		className="button--icon hover:bg-red-600 h-9"
																		onClick={() => confirmDelete(photo.pid)}
																	>
																		<Icon name="trash" className="" />
																	</button>
																</Tooltip> */}
								</div>
							</div>
						</div>
					))}
			</>
		)
	}

	return (
		<>
			<button
				type="button"
				onClick={openModal}
				className="flex items-center py-1 px-2 rounded transition hover:bg-neutral-800 text-neutral-500 hover:text-neutral-200"
			>
				<Icon name="images" className="mr-2" />
				Photos
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

					<div className="fixed inset-0 overflow-y-auto">
						<div className="flex min-h-full items-center justify-center p-4 text-center">
							<Transition.Child
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0 scale-95"
								enterTo="opacity-100 scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 scale-100"
								leaveTo="opacity-0 scale-95"
							>
								<Dialog.Panel className="w-full max-w-5xl transform rounded-2xl dark:bg-neutral-800 text-left align-middle shadow-xl transition-all">
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
											Photos
										</h3>
									</Dialog.Title>
									<Dialog.Description
										as="main"
										className="h-[600px] max-h-[80vh] overflow-y-auto w-full"
									>
										<div className="mb-2 px-6">
											<div
												onClick={handleAdd}
												className={clsx(
													'my-4 w-full h-28 border-2 border-dashed transition text-neutral-600 hover:text-neutral-200 border-neutral-600 hover:border-neutral-200 rounded-xl hover:cursor-pointer flex items-center justify-center',
													processing &&
														'bg-black hover:cursor-not-allowed animate-pulse'
												)}
											>
												<span className="text-xl font-bold">
													{processing ? 'Processing...' : 'Add'}
												</span>
												<input
													type="file"
													onChange={handleChange}
													name="story"
													className="hidden"
													ref={photoRef}
													multiple
													accept=".jpeg,.jpg"
												/>
											</div>
										</div>
										<div className="px-6 flex flex-wrap">
											{data?.photos && <ListPhotos photos={data?.photos} />}
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
