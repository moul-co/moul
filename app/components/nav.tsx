import { Link, useParams } from '@remix-run/react'
import { get, set } from 'idb-keyval'
import Markdoc from '@markdoc/markdoc'

import logo from '~/images/logo.svg'
import NavPhotos from '~/components/nav-photos'
// import NavStories from '~/components/nav-stories'
import NavProfile from '~/components/nav-profile'
import { Profile } from '~/types'
import { markdocConfig, toastSuccess } from '~/utilities'
import { useState } from 'react'

export default function Nav({ profile }: { profile: Profile }) {
	const [btnText, setBtnText] = useState('Save')
	const [disabled, setDisabled] = useState(false)
	const { slug = 'index' } = useParams()

	const handleSave = async () => {
		setBtnText('Saving...')
		setDisabled(true)
		const story = await get(`story-${slug}`)
		const ast = Markdoc.parse(story)
		const content = Markdoc.transform(ast, markdocConfig)

		const resp = await fetch(`/_moul/kv?prefix=story&slug=${slug}`, {
			method: 'POST',
			body: JSON.stringify(content),
		})
		if (!resp.ok) {
			console.error('log error')
		}
		console.log(resp.ok)
		toastSuccess('Your changes have been saved!')
		setBtnText('Save')
		setDisabled(false)
	}

	return (
		<section className="flex items-center justify-between px-8 py-3 sticky top-0 z-40 dark:bg-neutral-900 border-b border-neutral-800">
			<Link to="/" className="w-8 h-8">
				<img src={logo} alt="Moul's logo" className="w-8 h-8" />
			</Link>
			<nav className="flex">
				<NavProfile profile={profile} />
				{/* <NavStories /> */}
				<NavPhotos />
			</nav>
			<nav className="w-36 flex justify-end">
				{slug !== 'index' && (
					<button
						className="button w-auto py-2"
						onClick={handleSave}
						disabled={disabled}
					>
						{btnText}
					</button>
				)}
			</nav>
		</section>
	)
}
