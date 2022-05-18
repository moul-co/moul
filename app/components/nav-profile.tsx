import { Fragment, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Disclosure } from '@headlessui/react'
import { get, set } from 'idb-keyval'
import Icon from '~/components/social-icon'

export default function NavProfile() {
	const [isOpen, setIsOpen] = useState(false)
	const photoRef = useRef() as any

	function handleAdd() {
		photoRef.current.click()
	}

	async function closeModal() {
		setIsOpen(false)
	}

	async function openModal() {
		const photos = await get('photos')
		if (photos) {
			photos.forEach((p: any) => console.log(URL.createObjectURL(p)))
		}
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

	return (
		<>
			<button
				type="button"
				onClick={openModal}
				className="flex items-center hover:bg-neutral-800 py-1 px-2 rounded transition dark:text-neutral-500 dark:hover:text-neutral-200 mr-2"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					fill="currentColor"
					viewBox="0 0 16 16"
					className="mr-2"
				>
					<path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
				</svg>
				Profile
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
										className="sticky top-0 px-6 py-2.5 flex items-center justify-between"
									>
										<h3 className="text-xl font-bold leading-6 text-neutral-200">
											Profile
										</h3>
										<button className="button w-auto py-2.5 font-normal">
											Save
										</button>
									</Dialog.Title>
									<Dialog.Description
										as="main"
										className="h-[600px] max-h-[80vh] overflow-y-auto"
									>
										<div className="mb-2 px-6">
											<div
												onClick={handleAdd}
												className="mx-auto my-5 w-full h-44 border-2 border-dashed transition text-neutral-600 hover:text-neutral-200 border-neutral-600 hover:border-neutral-200 rounded-xl hover:cursor-pointer flex items-center justify-center"
											>
												<span className="text-sm font-bold">Cover</span>
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
												onClick={handleAdd}
												className="mx-auto my-5 w-28 h-28 border-2 border-dashed transition text-neutral-600 hover:text-neutral-200 border-neutral-600 hover:border-neutral-200 rounded-full hover:cursor-pointer flex items-center justify-center"
											>
												<span className="text-sm font-bold">Picture</span>
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
											<div className="relative mb-4">
												<label htmlFor="name" className="label">
													Name
												</label>
												<input
													type="text"
													className="input"
													id="name"
													name="name"
												/>
											</div>
											<div className="relative mb-4">
												<label htmlFor="bio" className="label">
													Bio
												</label>
												<textarea
													name="bio"
													id="bio"
													rows={6}
													className="input h-24"
												></textarea>
											</div>

											<div className="relative mb-4">
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
												/>
											</div>
											<div className="relative mb-4">
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
												/>
											</div>
											<div className="relative mb-4">
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
												/>
											</div>
											<div className="relative mb-4">
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
												/>
											</div>
											<div className="relative mb-4">
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
