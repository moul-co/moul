import { Fragment, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { get, set } from 'idb-keyval'
import Icon from './icon'

export default function NavPhotos() {
	let [isOpen, setIsOpen] = useState(false)
	const photoRef = useRef() as any

	function handleAdd() {
		photoRef.current.click()
	}

	async function closeModal() {
		setIsOpen(false)
	}

	async function openModal() {
		let photos = await get('photos')
		if (photos) {
			photos.forEach((p: any) => console.log(URL.createObjectURL(p)))
		}
		setIsOpen(true)
	}

	function handleChange(event: any) {
		for (const file of event.target.files) {
			const reader = new FileReader()
			reader.onload = async (e: any) => {
				let photos = (await get('photos')) || []
				const result = await fetch(`${e.target.result}`)
				const blob = await result.blob()
				await set('photos', [...photos, blob])
			}
			reader.readAsDataURL(file)
		}
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
						<div className="fixed inset-0 bg-black bg-opacity-50" />
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
										<button className="button w-auto py-2.5 font-normal mr-4">
											Insert
										</button>
									</Dialog.Title>
									<Dialog.Description
										as="main"
										className="h-[600px] max-h-[80vh] overflow-y-auto"
									>
										<div className="mb-2 px-6">
											<div
												onClick={handleAdd}
												className="my-4 w-full h-28 border-2 border-dashed transition text-neutral-600 hover:text-neutral-200 border-neutral-600 hover:border-neutral-200 rounded-xl hover:cursor-pointer flex items-center justify-center"
											>
												<span className="text-xl font-bold">Add</span>
												<input
													type="file"
													onChange={handleChange}
													name="photos"
													className="hidden"
													ref={photoRef}
													multiple
													accept=".jpeg,.jpg"
												/>
											</div>
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
