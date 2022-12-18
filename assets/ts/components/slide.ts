import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import EmblaCarousel, { EmblaCarouselType } from 'embla-carousel'
import { getSize } from '../utils'

@customElement('moul-slide')
export class MoulSlide extends LitElement {
	@state()
	carousel!: EmblaCarouselType

	@state()
	slidePictures!: NodeListOf<HTMLElement>

	protected createRenderRoot() {
		return this
	}

	updated() {
		if (!this.slidePictures) {
			this.slidePictures = this.renderRoot.querySelectorAll(
				'.moul-slide-picture'
			)

			this.slidePictures.forEach((p) => {
				const [w, h] = p.getAttribute('data-size')?.split(':') as string[]
				const { width, height } = getSize(
					+w,
					+h,
					window.innerWidth,
					window.innerHeight
				)
				const img = p.querySelector('img') as HTMLElement
				img.style.width = `${width}px`
				img.style.height = `${height}px`
			})
		}

		if (!this.carousel) {
			const slide = this.renderRoot.querySelector('.moul-slide') as HTMLElement
			const viewport = slide.querySelector(
				'.moul-slide-viewport'
			) as HTMLElement
			const options = { loop: false }

			this.carousel = EmblaCarousel(viewport, options)
			this.carousel.on('select', () => {
				const url = new URL(`${location}`) as any
				const currentHash =
					this.slidePictures[this.carousel.selectedScrollSnap()].getAttribute(
						'data-pid'
					)
				url.hash = currentHash
				history.pushState({}, '', url)
			})
		}
	}

	render() {
		return html`<slot></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'moul-slide': MoulSlide
	}
}
