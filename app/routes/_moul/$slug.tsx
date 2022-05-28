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
	useParams,
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
	if (session.get('auth') !== true) {
		return json({ status: 'Unauthorized' })
	}
	const profile = (await MOUL_KV.get('profile')) as any

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
	const { slug = 'index' } = useParams()
	const [profile, setProfile] = useState(profileKV)

	useEffect(() => {
		const getStory = async () => {
			const story = await get(`story-${slug}`)
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
	}, [])

	const handleChange = async () => {
		const updated = editorRef?.current.getValue()
		setText(updated)
		await set(`story-${slug}`, updated)

		const ast = Markdoc.parse(updated)
		const errors = Markdoc.validate(ast, markdocConfig)
		console.log('errors', errors) //! show errors properly
		const content = Markdoc.transform(ast, markdocConfig)
		setContent(content)
		console.log(content)
	}

	return (
		<>
			<aside className="editor-wrap overflow-auto sticky top-14">
				<Editor ref={editorRef} initialValue={text} onChange={handleChange} />
			</aside>
			<div className="gutter-col gutter-col-1"></div>
			<main className="h-auto">
				{profileKV && <Preview content={content} profile={profileKV} />}
			</main>
		</>
	)
}
