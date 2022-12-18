import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { fixed_partition } from 'image-layout'
import { getContainerWidth, getIdealElementHeight, getSize } from '../utils'

@customElement('moul-grid')
export class MoulGrid extends LitElement {
	protected createRenderRoot() {
		return this
	}

	connectedCallback() {
		super.connectedCallback()
		window.addEventListener('resize', (event) =>
			this._handleResize(event, this.renderRoot as HTMLElement)
		)
	}

	disconnectedCallback() {
		window.removeEventListener('resize', (event) => {
			this._handleResize(event, this.renderRoot as HTMLElement)
		})
		super.disconnectedCallback()
	}

	updated() {
		this._renderGrid(this.renderRoot as HTMLElement)
	}

	_handleResize(event: any, renderRoot: HTMLElement) {
		this._renderGrid(renderRoot)
	}

	_renderGrid(renderRoot: HTMLElement) {
		const pictures = renderRoot.querySelectorAll(
			'.picture-grid'
		) as NodeListOf<HTMLElement>
		const pictureSizes: { width: number; height: number }[] = []
		pictures.forEach((p) => {
			const [w, h] = p.getAttribute('data-size')?.split(':') as string[]
			pictureSizes.push(getSize(+w, +h, 2048, 2048))
		})

		const idealElementHeight = getIdealElementHeight(pictureSizes.length)
		const containerWidth = getContainerWidth(pictureSizes.length)
		const layout = fixed_partition(pictureSizes, {
			containerWidth,
			idealElementHeight,
			spacing: 16,
		}) as any

		;(renderRoot as HTMLElement).style.width = `${layout.width}px`
		;(renderRoot as HTMLElement).style.height = `${layout.height}px`
		layout.positions.forEach((_: any, i: number) => {
			pictures[i].style.position = `absolute`
			pictures[i].style.top = `${layout.positions[i].y}px`
			pictures[i].style.left = `${layout.positions[i].x}px`
			pictures[i].style.width = `${layout.positions[i].width}px`
			pictures[i].style.height = `${layout.positions[i].height}px`
			pictures[i].querySelector(
				'img'
			)!.style.width = `${layout.positions[i].width}px`
			pictures[i].querySelector(
				'img'
			)!.style.height = `${layout.positions[i].height}px`
		})
	}

	render() {
		return html`<slot></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'moul-grid': MoulGrid
	}
}
