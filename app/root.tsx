import type { MetaFunction, LinksFunction } from '@remix-run/cloudflare'
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from '@remix-run/react'

import styles from '~/moul.css'
import faviconDarkSvg from '~/images/favicon/dark.svg'
import faviconLightSvg from '~/images/favicon/light.svg'
import faviconDarkPng from '~/images/favicon/dark.png'
import faviconLightPng from '~/images/favicon/light.png'
import { useEffect } from 'react'
import { isBrowser } from './utilities'

export const meta: MetaFunction = () => ({
	charset: 'utf-8',
	title: 'Moul — The minimalist publishing tool for photographers',
	viewport: 'width=device-width,initial-scale=1',
})

export const links: LinksFunction = () => {
	return [
		{ rel: 'stylesheet', href: styles },
		{ rel: 'icon', type: 'image/svg+xml', href: faviconLightSvg },
		{ rel: 'icon', type: 'image/png', href: faviconLightPng },
	]
}

export default function App() {
	useEffect(() => {
		const updateFavicon = (darkMode: boolean) => {
			const faviconSvg = document.querySelector('link[type="image/svg+xml"]')
			const faviconPng = document.querySelector('link[type="image/png"]')
			if (darkMode) {
				faviconSvg?.setAttribute('href', faviconLightSvg)
				faviconPng?.setAttribute('href', faviconLightPng)
			} else {
				faviconSvg?.setAttribute('href', faviconDarkSvg)
				faviconPng?.setAttribute('href', faviconDarkPng)
			}
		}

		if (isBrowser()) {
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
			mediaQuery.addEventListener('change', (event) =>
				updateFavicon(event.matches)
			)
			updateFavicon(mediaQuery.matches)
		}
	}, [])

	return (
		<html lang="en">
			<head>
				<Meta />
				<Links />
			</head>
			<body className="dark:bg-neutral-900 dark:text-neutral-50 bg-white text-neutral-900 overflow-x-hidden">
				<Outlet />
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	)
}
