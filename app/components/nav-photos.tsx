import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useRef, useState } from 'react'
import { get, set } from 'idb-keyval'

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
				className="flex hover:bg-neutral-800 py-1 px-2 rounded transition dark:text-neutral-500 dark:hover:text-neutral-200"
			>
				<svg
					className="mr-1"
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					strokeWidth="1.5"
					stroke="currentColor"
					fill="none"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
					<line x1="15" y1="8" x2="15.01" y2="8"></line>
					<rect x="4" y="4" width="16" height="16" rx="3"></rect>
					<path d="M4 15l4 -4a3 5 0 0 1 3 0l5 5"></path>
					<path d="M14 14l1 -1a3 5 0 0 1 3 0l2 2"></path>
				</svg>
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
						<div className="fixed inset-0 bg-black bg-opacity-30" />
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
								<Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl dark:bg-neutral-800 p-6 text-left align-middle shadow-xl transition-all">
									<Dialog.Title
										as="h3"
										className="text-xl font-bold leading-6 text-neutral-200"
									>
										Photos
									</Dialog.Title>
									<div className="mt-2">
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
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition>
		</>
	)
}
