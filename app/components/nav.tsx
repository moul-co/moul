import { Link } from '@remix-run/react'
import logo from '~/images/logo.svg'
import NavPhotos from '~/components/nav-photos'
import NavStories from '~/components/nav-stories'
import NavProfile from '~/components/nav-profile'

export default function Nav() {
	return (
		<section className="flex items-center justify-between px-8 py-3 sticky top-0 z-40 dark:bg-neutral-900 border-b border-neutral-800">
			<Link to="/" className="w-8 h-8">
				<img src={logo} alt="Moul's logo" className="w-8 h-8" />
			</Link>
			<nav className="flex ">
				<NavProfile />
				<NavStories />
				<NavPhotos />
			</nav>
			<nav>
				<Link to="/">Home</Link>
			</nav>
		</section>
	)
}
