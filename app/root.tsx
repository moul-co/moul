import {
	Links,
	LinksFunction,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from 'remix'
import type { MetaFunction } from 'remix'
import moulStyle from '~/moul.css'

export const meta: MetaFunction = () => ({
	charset: 'utf-8',
	title: 'Moul',
	viewport: 'width=device-width,initial-scale=1',
})

export const links: LinksFunction = () => {
	return [{ rel: 'stylesheet', href: moulStyle }]
}

export default function App() {
	return (
		<html lang="en">
			<head>
				<Meta />
				<Links />
			</head>
			<body className="dark:bg-black dark:text-white bg-white text-black overflow-x-hidden">
				<Outlet />
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	)
}
