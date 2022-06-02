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

import { isBrowser, markdocConfig } from '~/utilities'
import {
	Form,
	Outlet,
	Scripts,
	useActionData,
	useFetcher,
	useLoaderData,
	useParams,
} from '@remix-run/react'
import { getSession, commitSession } from '~/session'
import { Photo } from '~/types'

export const loader: LoaderFunction = async ({ request, params }) => {
	const session = await getSession(request.headers.get('Cookie'))
	if (session.get('auth') !== true) {
		return json({ status: 'Unauthorized' })
	}
	const { slug } = params
	const profile = await MOUL_KV.get('profile', { type: 'json' })
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

	const story = await MOUL_KV.get(`story-${slug}`, { type: 'json' })
	const storyMd = await MOUL_KV.get(`md-${slug}`)
	return json({ profile, photos, slug, story, storyMd })
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
	const { profile, status, photos, story, storyMd } = useLoaderData()
	const { slug = 'index' } = useParams()

	useEffect(() => {
		Split({
			columnGutters: [
				{
					track: 1,
					element: document.querySelector('.gutter-col-1') as any,
				},
			],
			onDragEnd: () => {
				handleChange()
			},
		})
	}, [])

	const handleChange = async () => {
		const updated = editorRef?.current.getValue()
		setText(updated)
		await set(`md-${slug}`, updated)

		const ast = Markdoc.parse(updated)
		const errors = Markdoc.validate(ast, markdocConfig)
		console.log('errors', errors) //! show errors properly
		const content = Markdoc.transform(ast, markdocConfig)
		setContent(content)
	}

	return (
		<>
			<aside className="editor-wrap overflow-auto sticky top-14">
				<Editor
					ref={editorRef}
					initialValue={storyMd}
					onChange={handleChange}
				/>
			</aside>
			<div className="gutter-col gutter-col-1"></div>
			<main className="h-auto">
				{profile && <Preview content={content || story} profile={profile} />}
			</main>
		</>
	)
}
