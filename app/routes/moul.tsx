import { useEffect, useRef, useState } from 'react'
import { ActionFunction, json, LoaderFunction } from '@remix-run/cloudflare'
import Split from 'split-grid'
import { get, set } from 'idb-keyval'
import Markdoc from '@markdoc/markdoc'

import Nav from '~/components/nav'
import Editor from '~/components/editor'
import Preview from '~/components/preview'

import { markdocConfig } from '~/utilities/markdoc'
import { Form, useLoaderData } from '@remix-run/react'

export const action: ActionFunction = async ({ request, context }) => {
	const formData = await request.formData()
	const moulKV = context.MOUL as KVNamespace
	await moulKV.put('profile', JSON.stringify(Object.fromEntries(formData)))
	const stories = await moulKV.get('stories')
	const profile = await moulKV.get('profile')

	return json({ profile, stories })
}

export const loader: LoaderFunction = async ({ request, context }) => {
	const moulKV = context.MOUL as KVNamespace
	const profile = await moulKV.get('profile')

	return json({ profile })
}

export default function Moul() {
	const editorRef = useRef() as any
	const [text, setText] = useState('')
	const [content, setContent] = useState(null as any)
	const { profile } = useLoaderData()

	useEffect(() => {
		const getStory = async () => {
			const story = await get('story')
			setText(story)
			editorRef.current.setValue(story)
		}
		getStory().catch(console.error)

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
		const updated = editorRef.current.getValue()
		setText(updated)
		await set('story', updated)

		const ast = Markdoc.parse(updated)
		const errors = Markdoc.validate(ast, markdocConfig)
		console.log('errors', errors) //! show errors properly
		const content = Markdoc.transform(ast, markdocConfig)
		setContent(content)
	}

	return (
		<>
			<Nav profile={JSON.parse(profile)} />
			<section className="grid relative">
				<aside className="editor-wrap overflow-auto sticky top-14">
					<Editor ref={editorRef} initialValue={text} onChange={handleChange} />
				</aside>
				<div className="gutter-col gutter-col-1"></div>
				<main>
					<Preview content={content} />
				</main>
			</section>
		</>
	)
}
