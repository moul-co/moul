import { useEffect, useRef, useState } from 'react'
import {
	ActionFunction,
	HeadersFunction,
	json,
	LinksFunction,
	LoaderFunction,
	redirect,
} from '@remix-run/cloudflare'
import Split from 'split-grid'
import { get, set } from 'idb-keyval'
import Markdoc from '@markdoc/markdoc'

import Nav from '~/components/nav'
import Editor from '~/components/editor'
import Preview from '~/components/preview'

import { markdocConfig } from '~/utilities'
import {
	Form,
	Outlet,
	Scripts,
	useActionData,
	useLoaderData,
} from '@remix-run/react'
import { getSession, commitSession } from '~/session'

//? KV prefix
/**
 * `profile`
 * `story-{slug}` slug is dynamic base on real pathname
 */

//? R2 prefix + path
/**
 * `moul/photos/profile-picture/{uuid}/{size}` uuid is the pathname from URL.createObjectURL(), size is `md` or `xl`
 * `moul/photos/profile-cover/{uuid}/{size}`
 * `moul/photos/story-{slug}/{uuid}/{size}`
 */

export const action: ActionFunction = async ({ request }) => {
	const session = await getSession(request.headers.get('Cookie'))
	const formData = await request.formData()
	if (formData.has('key')) {
		const key = formData.get('key')
		if (key === MOUL_SECRET_ACCESS_KEY) {
			session.set('auth', true)
			return redirect('/_moul', {
				headers: {
					'Set-Cookie': await commitSession(session),
				},
			})
		}
	}
	if (session.get('auth') !== 'true') {
		return redirect('/_moul')
	}
	return new Response('Method Not Allowed', { status: 405 })
}

export const loader: LoaderFunction = async ({ request, params }) => {
	const session = await getSession(request.headers.get('Cookie'))
	if (!session.has('auth')) {
		return json({ status: 'Unauthorized' })
	}
	const { slug } = params
	const profile = (await MOUL_KV.get('profile')) as any
	console.log({ slug, profile })

	return json({ profileKV: JSON.parse(profile) })
}

export const headers: HeadersFunction = () => {
	return {
		'Cross-Origin-Embedder-Policy': 'require-corp',
		'Cross-Origin-Opener-Policy': 'same-origin',
	}
}

export default function MoulSlug() {
	const editorRef = useRef() as any
	const [text, setText] = useState('')
	const [content, setContent] = useState(null) as any
	const { profileKV, status } = useLoaderData()
	const [profile, setProfile] = useState(profileKV)

	useEffect(() => {
		const getStory = async () => {
			const story = await get('story')
			setText(story)
			editorRef?.current?.setValue(story)
		}
		getStory().catch(console.error)
		// if (!profile) {
		// 		const getProfile = async () => {
		// 			const profile = await get('profile')
		// 			setProfile(profile)
		// 		}
		// 		getProfile().catch(console.error)
		// }

		// initialize grid
		Split({
			columnGutters: [
				{
					track: 1,
					element: document.querySelector('.gutter-col-1') as any,
				},
			],
		})

		// initialize wasm
		const wasm = async () => {
			const go = new Go()
			const moulWasm = await WebAssembly.instantiateStreaming(
				fetch('/build/moul.wasm'),
				go.importObject
			)
			go.run(moulWasm.instance)
		}
		wasm().catch(console.error)
	}, [])

	const handleChange = async () => {
		const updated = editorRef?.current.getValue()
		setText(updated)
		await set('story', updated)

		const ast = Markdoc.parse(updated)
		const errors = Markdoc.validate(ast, markdocConfig)
		console.log('errors', errors) //! show errors properly
		const content = Markdoc.transform(ast, markdocConfig)
		setContent(content)
	}

	return (
		<div className="bg-neutral-900 text-neutral-50">
			{status === 'Unauthorized' ? (
				<>
					<div className="max-w-md w-full h-screen mx-auto flex justify-center flex-col">
						<h1 className="text-3xl font-bold mb-4">Log in</h1>
						<Form method="post" id="profileForm">
							<div className="relative mb-5">
								<label htmlFor="name" className="label">
									Access Key
								</label>
								<input
									type="password"
									className="input bg-black"
									id="key"
									name="key"
									autoComplete="false"
									autoCapitalize="false"
								/>
							</div>
							<button className="button" type="submit">
								Log in
							</button>
						</Form>
					</div>
				</>
			) : (
				<>
					<script src="/build/wasm_exec.js"></script>
					<script src="/build/vips.js"></script>
					<script type="module">window.vips = await Vips();</script>

					<Nav profile={profileKV} />
					<section className="grid relative">
						<aside className="editor-wrap overflow-auto sticky top-14">
							<Editor
								ref={editorRef}
								initialValue={text}
								onChange={handleChange}
							/>
						</aside>
						<div className="gutter-col gutter-col-1"></div>
						<main>
							{profileKV && <Preview content={content} profile={profileKV} />}
						</main>
					</section>
				</>
			)}
		</div>
	)
}
