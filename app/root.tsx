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
import favicon from '~/images/favicon/favicon.svg'

export const meta: MetaFunction = () => ({
	charset: 'utf-8',
	title: 'Moul — The minimalist publishing tool for photographers',
	viewport: 'width=device-width,initial-scale=1',
})

export const links: LinksFunction = () => {
	return [
		{ rel: 'stylesheet', href: styles },
		{ rel: 'icon', type: 'image/svg+xml', href: favicon },
	]
}

export default function App() {
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
