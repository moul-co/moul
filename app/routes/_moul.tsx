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
import slugify from '@sindresorhus/slugify'
import toastCss from '~/ReactToastify.css'
import { ToastContainer } from 'react-toastify'

import Nav from '~/components/nav'

import { markdocConfig } from '~/utilities'
import {
	Form,
	Outlet,
	Scripts,
	useActionData,
	useLoaderData,
} from '@remix-run/react'
import { getSession, commitSession } from '~/session'
import { Photo } from '~/types'

//? KV prefix
/**
 * `profile`
 * `photo-{slug}-{pid}`
 * `story-{slug}` slug is dynamic base on real pathname
 */

//? R2 prefix + path
/**
 * `moul/photos/profile-picture/{pid}/{size}`
 * `moul/photos/profile-cover/{pid}/{size}`
 * `moul/photos/story/{pid}/{size}`
 */

export const action: ActionFunction = async ({ request }) => {
	const session = await getSession(request.headers.get('Cookie'))
	const formData = await request.formData()
	if (formData.has('key')) {
		const key = formData.get('key')
		if (key === MOUL_ACCESS_KEY) {
			session.set('auth', true)
			return redirect('/_moul', {
				headers: {
					'Set-Cookie': await commitSession(session),
				},
			})
		}
	}
	if (session.get('auth') !== true) {
		return redirect('/_moul')
	}
	return new Response('Method Not Allowed', { status: 405 })
}

export const loader: LoaderFunction = async ({ request, params }) => {
	const session = await getSession(request.headers.get('Cookie'))
	if (session.get('auth') !== true) {
		return json({ status: 'Unauthorized' })
	}
	const { slug } = params
	let profile = await MOUL_KV.get('profile', { type: 'json' })
	const photosKeys = await MOUL_KV.list({ prefix: `photo-${slug}` })
	const photos: Photo[] = []
	if (photosKeys) {
		for (let key of photosKeys.keys) {
			const photo = (await MOUL_KV.get(key.name, { type: 'json' })) as Photo
			if (photo) {
				photos.push(photo)
			}
		}
	}

	if (!profile)
		profile = {
			name: '',
			bio: '',
			github: '',
			twitter: '',
			youtube: '',
			instagram: '',
			facebook: '',
		}
	// set default profile
	await MOUL_KV.put('profile', JSON.stringify(profile))

	if (slug) {
		const formatedSlug = slugify(slug)
		let story = await MOUL_KV.get(`story-${formatedSlug}`, { type: 'json' })
		if (!story) {
			story = `{}`
		}
		let storyMd = await MOUL_KV.get(`md-${formatedSlug}`)

		return json({ profile, story, photos, storyMd })
	}
	const stories = await MOUL_KV.list({ prefix: 'story' })

	return json({ profile, stories, photos })
}

export const headers: HeadersFunction = () => {
	return {
		'Cross-Origin-Embedder-Policy': 'require-corp',
		'Cross-Origin-Opener-Policy': 'same-origin',
	}
}

export const links: LinksFunction = () => {
	return [
		{
			rel: 'stylesheet',
			href: toastCss,
		},
	]
}

export default function Moul() {
	const editorRef = useRef() as any
	const [text, setText] = useState('')
	const [content, setContent] = useState(null) as any
	const { profile, status, photos } = useLoaderData()

	useEffect(() => {
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

					<Nav profile={profile} />
					<section className="grid relative">
						<Outlet />
					</section>
				</>
			)}
			<ToastContainer
				position="bottom-center"
				autoClose={1500}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss={false}
				draggable
				pauseOnHover={false}
			/>
		</div>
	)
}
