import React, { useState, useEffect } from 'react'
import { render } from 'react-dom'
import { fixed_partition } from 'image-layout'
import Bound from 'bounds.js'
import photoswipe from './ps'

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
const boundary = Bound({
  margins: {
    bottom: 100
  }
})

const calculate = (collection, containerWidth) => {
  let idealElementHeight = 350
  if (containerWidth < 600) {
    idealElementHeight = 250
  }

  const layout = fixed_partition(collection, {
    containerWidth,
    idealElementHeight,
    spacing: 16
  })

  const calculated = []
  layout.positions.map((p, i) => {
    const srcHd = collection[i].id
      ? `${collection[i].id}/photos/collection/2048/${collection[i].name}`
      : `photos/collection/${collection[i].name}`
    const src = collection[i].id
      ? `${collection[i].id}/photos/collection/750/${collection[i].name}`
      : `photos/collection/${collection[i].name}`

    calculated.push({
      src,
      srcHd,
      name: collection[i].name,
      dimension: `${collection[i].width_hd}x${collection[i].height_hd}`,
      srcset: collection[i].srcset,
      color: collection[i].color,
      inline: {
        width: `${layout.positions[i].width}px`,
        height: `${layout.positions[i].height}px`,
        top: `${layout.positions[i].y}px`,
        left: `${layout.positions[i].x}px`,
        background: collection[i].color || ''
      }
    })
  })

  return {
    calculated,
    width: layout.width,
    height: layout.height
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
            <a href={p.srcHd} data-dimension={p.dimension} data-color={p.color}>
              <img
                data-src={p.src}
                alt={p.name}
                style={p.inline}
                className="lazy"
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
    JSON.parse($('#photo-collection').getAttribute('value'))
  )
  const [containerWidth, setContainerWidth] = useState(window.innerWidth - 32)

  const onEnter = photo => {
    return () => {
      photo.src = photo.dataset.src
      boundary.unWatch(photo)
    }
  }

  function handleResize() {
    setContainerWidth(window.innerWidth - 32)
  }

  useEffect(() => {
    window.addEventListener('optimizedResize', handleResize)
    photoswipe('.collection')

    const photos = $$('img.lazy')
    photos.forEach(p => {
      boundary.watch(p, onEnter(p))
    })

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

render(<Collection />, $('#moul-collection'))
