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
import { Photo } from '~/types'

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
		if (key === MOUL_ACCESS_KEY) {
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
	const profile = await MOUL_KV.get('profile', { type: 'json' })
	const photosKeys = await MOUL_KV.list({ prefix: `photo-` })
	const photos: Photo[] = []
	if (photosKeys) {
		for (let key of photosKeys.keys) {
			const photo = (await MOUL_KV.get(key.name, { type: 'json' })) as Photo
			if (photo) {
				photos.push(photo)
			}
		}
	}

	const listStories = await MOUL_KV.list({ prefix: 'story-' })
	const stories = []
	if (listStories) {
		for (let key of listStories.keys) {
			const story = (await MOUL_KV.get(key.name, { type: 'json' })) as any
			if (story) {
				let slugArr = key.name.split('-')
				slugArr.shift()
				story.slug = slugArr.join('-')
				const coverExist = story.children.find((c: any) => c.name === 'cover')
				story.title = story.children.find((c: any) => c.name === 'title')
				story.cover = photos.find(
					(p: Photo) => p.pid === coverExist?.children[0].attributes.pid
				)
				stories.push(story)
			}
		}
	}

	return json({ profile, stories, photos })
}

export const headers: HeadersFunction = () => {
	return {
		'Cross-Origin-Embedder-Policy': 'require-corp',
		'Cross-Origin-Opener-Policy': 'same-origin',
	}
}

export default function MoulIndex() {
	const editorRef = useRef() as any
	const [text, setText] = useState('')
	const [content, setContent] = useState(null) as any
	const { profile, status, stories } = useLoaderData()
	const { slug = 'index' } = useParams()

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
	}

	return (
		<>
			<aside className="editor-wrap overflow-auto sticky top-14">
				<Editor ref={editorRef} initialValue={text} onChange={handleChange} />
			</aside>
			<div className="gutter-col gutter-col-1"></div>
			<main>
				<Preview content={content} profile={profile} stories={stories} />
			</main>
		</>
	)
}
