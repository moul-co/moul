import lazySizes from 'lazysizes'
import './components/grid'
import './components/slide'

lazySizes.cfg.lazyClass = 'lazy'

document.addEventListener('DOMContentLoaded', () => {
	const url = new URL(`${location}`)
	if (url.hash) {
		const slide = document.querySelector('moul-slide')
		slide?.setAttribute('pid', url.hash)
		slide?.removeAttribute('hidden')
	}
})
