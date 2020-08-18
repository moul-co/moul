import React, { useState, useEffect } from 'react'
import { render } from 'react-dom'
import { fixed_partition } from 'image-layout'
import ps from './ps'
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

const calculate = (collection, containerWidth, cp) => {
	let idealElementHeight = 330
	if (containerWidth < 600) {
		idealElementHeight = 280
	}

	const layout = fixed_partition(collection, {
		containerWidth,
		idealElementHeight,
		spacing: 8,
	})

	const calculated = []
	const by = $('#by').value
	layout.positions.map((p, i) => {
		const srcHd = collection[i].id
			? `photos/${collection[i].id}/${cp}/2048/${collection[i].name}-by-${by}.jpg`
			: `photos/${cp}/${collection[i].src}`
		const src = collection[i].id
			? `photos/${collection[i].id}/${cp}/750/${collection[i].name}-by-${by}.jpg`
			: `photos/${cp}/${collection[i].src}`
		const sqip = collection[i].id
			? `photos/${collection[i].id}/${cp}/sqip/${collection[i].name}-by-${by}.svg`
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

const Layout = ({ collection, containerWidth, cp }) => {
	const { calculated, width, height } = calculate(
		collection,
		containerWidth,
		cp
	)
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

const Collection = ({ photos, cp }) => {
	const [collection, setCollection] = useState(photos)
	const [containerWidth, setContainerWidth] = useState(window.innerWidth - 16)

	function handleResize() {
		setContainerWidth(window.innerWidth - 16)
	}

	useEffect(() => {
		window.addEventListener('optimizedResize', handleResize)
		ps('.collection')
		lazySizes.init()

		return () => {
			window.removeEventListener('optimizedResize', handleResize)
		}
	})

	return (
		<>
			<Layout collection={collection} containerWidth={containerWidth} cp={cp} />
		</>
	)
}

const collections = $$('.photo-collection')
collections.forEach((c, i) => {
	render(
		<Collection
			photos={JSON.parse(c.getAttribute('value'))}
			cp={c.getAttribute('data-cp')}
		/>,
		$(`.moul-collection-${i}`)
	)
})
