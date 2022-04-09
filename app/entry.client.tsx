import { hydrate } from 'react-dom'
import { RemixBrowser } from '@remix-run/react'
import lazySizes from 'lazysizes'
lazySizes.cfg.lazyClass = 'lazy'

hydrate(<RemixBrowser />, document)
