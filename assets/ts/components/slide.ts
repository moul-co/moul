import { LitElement, html, nothing, css, PropertyValueMap } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import EmblaCarousel, { EmblaCarouselType } from 'embla-carousel'
import { getSize } from '../utils'

@customElement('moul-slide')
export class MoulSlide extends LitElement {
	@property({ type: String })
	pid?: String

	@state()
	carousel!: EmblaCarouselType

	@state()
	slidePictures!: NodeListOf<HTMLElement>

	@state()
	canScrollPrev = false

	@state()
	canScrollNext = false

	@state()
	hideUi = false

	connectedCallback() {
		super.connectedCallback()
		window.addEventListener('resize', (event) =>
			this._handleResize(event, this.renderRoot as HTMLElement)
		)
		window.addEventListener('popstate', (event) =>
			this._handlePopstate(event, this.renderRoot as HTMLElement)
		)
	}

	disconnectedCallback() {
		window.removeEventListener('resize', (event) => {
			this._handleResize(event, this.renderRoot as HTMLElement)
		})
		window.removeEventListener('popstate', (event) => {
			this._handlePopstate(event, this.renderRoot as HTMLElement)
		})

		super.disconnectedCallback()
	}

	protected createRenderRoot() {
		return this
	}

	firstUpdated() {
		this._init(this.renderRoot as HTMLElement)
	}

	protected updated(
		_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
	): void {
		if (_changedProperties.has('pid')) {
			this.slidePictures.forEach((picture, i) => {
				if (this.pid?.includes(picture.getAttribute('data-pid') || '')) {
					this.carousel.reInit({ startIndex: i })
					this.canScrollPrev = this.carousel.canScrollPrev()
					this.canScrollNext = this.carousel.canScrollNext()
				}
			})
		}
	}

	_handleResize(event: any, renderRoot: HTMLElement) {
		this._init(renderRoot, true)
		const url = new URL(`${location}`) as URL
		this.slidePictures.forEach((picture, i) => {
			if (url.hash.includes(picture.getAttribute('data-pid') || '')) {
				this.carousel.reInit({ startIndex: i })
				this.canScrollPrev = this.carousel.canScrollPrev()
				this.canScrollNext = this.carousel.canScrollNext()
			}
		})
	}

	_handlePopstate(event: any, renderRoot: HTMLElement) {
		renderRoot.removeAttribute('hidden')
		const url = new URL(`${location}`) as URL
		this.slidePictures.forEach((picture, i) => {
			if (url.hash.includes(picture.getAttribute('data-pid') || '')) {
				this.carousel.reInit({ startIndex: i })
				this.canScrollPrev = this.carousel.canScrollPrev()
				this.canScrollNext = this.carousel.canScrollNext()
			}
		})
	}

	_init(renderRoot: HTMLElement, reinit = false) {
		if (!this.slidePictures || reinit) {
			this.slidePictures = renderRoot.querySelectorAll('.moul-slide-picture')

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

		if (!this.carousel || reinit) {
			const slide = renderRoot.querySelector('.moul-slide') as HTMLElement
			const viewport = slide.querySelector(
				'.moul-slide-viewport'
			) as HTMLElement
			const options = { loop: false }

			this.carousel = EmblaCarousel(viewport, options)
			this.carousel.on('select', () => {
				this.canScrollPrev = this.carousel.canScrollPrev()
				this.canScrollNext = this.carousel.canScrollNext()
				const url = new URL(`${location}`) as URL
				const currentHash =
					this.slidePictures[this.carousel.selectedScrollSnap()].getAttribute(
						'data-pid'
					)
				url.hash = currentHash || ''
				if (!reinit) {
					history.pushState({}, '', url)
				}
			})
			this.canScrollPrev = this.carousel.canScrollPrev()
			this.canScrollNext = this.carousel.canScrollNext()
		}
	}

	handlePrev() {
		this.carousel.scrollPrev()
	}
	handleNext() {
		this.carousel.scrollNext()
	}
	handleClose() {
		const url = new URL(`${location}`) as any
		url.hash = ''
		history.pushState({}, '', url)
		;(this.renderRoot as HTMLElement).setAttribute('hidden', '')
	}

	render() {
		return html`<div class="moul-slide-ui" ?hidden=${this.hideUi}>
				${this.canScrollPrev
					? html`
							<button
								@click=${this.handlePrev}
								class="fixed z-30 border-0 p-0 bg-neutral-100/50 hover:bg-neutral-100 dark:bg-black/20 dark:hover:bg-black/60 transition-colors is-prev left-4 rounded-full"
							>
								<svg
									fill="currentColor"
									viewBox="0 0 16 16"
									class="w-9 h-9 rounded-full p-1"
								>
									<path
										fillRule="evenodd"
										d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"
									/>
								</svg>
							</button>
					  `
					: nothing}
				${this.canScrollNext
					? html`
							<button
								@click=${this.handleNext}
								class="fixed z-30 border-0 p-0 bg-neutral-100/50 hover:bg-neutral-100 dark:bg-black/20 dark:hover:bg-black/60 transition-colors is-next right-4 rounded-full"
							>
								<svg
									fill="currentColor"
									viewBox="0 0 16 16"
									class="w-9 h-9 rounded-full p-1"
								>
									<path
										fillRule="evenodd"
										d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"
									/>
								</svg>
							</button>
					  `
					: nothing}

				<button
					class="moul-darkbox-btn fixed top-4 right-4 p-0 border-0 bg-neutral-100/50 hover:bg-neutral-100 dark:bg-black/20 dark:hover:bg-black/60 transition-colors rounded-full z-50"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						fill="currentColor"
						viewBox="0 0 16 16"
						class="w-9 h-9 p-1.5"
					>
						<path
							d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1v6zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2z"
						/>
						<path
							d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"
						/>
					</svg>
				</button>
				<button
					@click=${this.handleClose}
					class="moul-darkbox-btn fixed z-50 border-0 p-0 bg-neutral-100/50 hover:bg-neutral-100 dark:bg-black/20 dark:hover:bg-black/60 transition-colors top-4 left-4 is-close rounded-full"
				>
					<svg
						fill="currentColor"
						viewBox="0 0 16 16"
						class="w-9 h-9 rounded-full p-1"
					>
						<path
							d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
						/>
					</svg>
				</button>
			</div>
			<slot></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'moul-slide': MoulSlide
	}
}
