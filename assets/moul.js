import React, { useState, useEffect } from 'react'
import { render } from 'react-dom'
import { fixed_partition } from 'image-layout'
// import photoswipe from '../node_modules/moul-photoswipe/moul-photoswipe'
import lazySizes from 'lazysizes'
;(() => {
	const throttle = (type, name, obj) => {
		obj = obj || window
		let running = false
		const func = () => {
			if (running) {
				return
			}
			running = true
			requestAnimationFrame(() => {
				obj.dispatchEvent(new CustomEvent(name))
				running = false
			})
		}
		obj.addEventListener(type, func)
	}
	throttle('resize', 'optimizedResize')
})()
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const calculate = (collection, containerWidth) => {
	let idealElementHeight = 350
	if (containerWidth < 600) {
		idealElementHeight = 250
	}

	const layout = fixed_partition(collection, {
		containerWidth,
		idealElementHeight,
		spacing: 16,
	})

	const calculated = []
	layout.positions.map((p, i) => {
		const srcHd = collection[i].id
			? `photos/${collection[i].id}/collection/2048/${collection[i].name}.jpg`
			: `photos/collection/${collection[i].src}`
		const src = collection[i].id
			? `photos/${collection[i].id}/collection/750/${collection[i].name}.jpg`
			: `photos/collection/${collection[i].src}`
		const sqip = collection[i].id
			? `photos/${collection[i].id}/collection/sqip/${collection[i].name}.svg`
			: ''

		calculated.push({
			src,
			srcHd,
			sqip,
			srcset: collection[i].srcset,
			name: collection[i].name,
			dimension: `${collection[i].width_hd}x${collection[i].height_hd}`,
			color: collection[i].color,
			inline: {
				width: `${layout.positions[i].width}px`,
				height: `${layout.positions[i].height}px`,
				top: `${layout.positions[i].y}px`,
				left: `${layout.positions[i].x}px`,
				background: collection[i].color || '',
			},
		})
	})

	return {
		calculated,
		width: layout.width,
		height: layout.height,
	}
}

const Layout = ({ collection, containerWidth }) => {
	const { calculated, width, height } = calculate(collection, containerWidth)
	const container = { width, height }

	return (
		<>
			<div className="collection" style={container}>
				{calculated.map((p, i) => (
					<figure key={i}>
						<a
							href={p.srcHd}
							data-dimension={p.dimension}
							data-pid={p.name}
							data-color={p.color}
						>
							<img
								src={p.sqip}
								data-src={p.src}
								alt={p.name}
								style={p.inline}
								className="lazyload"
							/>
						</a>
					</figure>
				))}
			</div>
		</>
	)
}

const Collection = ({ photos }) => {
	const [collection, setCollection] = useState(
		JSON.parse($('#photos').getAttribute('value'))
	)
	const [containerWidth, setContainerWidth] = useState(window.innerWidth - 32)

	function handleResize() {
		setContainerWidth(window.innerWidth - 32)
	}

	useEffect(() => {
		window.addEventListener('optimizedResize', handleResize)
		// photoswipe('.collection')
		lazySizes.init()

		return () => {
			window.removeEventListener('optimizedResize', handleResize)
		}
	})

	return (
		<>
			<Layout collection={collection} containerWidth={containerWidth} />
		</>
	)
}

render(<Collection />, $$('.moul-collection')[0])
