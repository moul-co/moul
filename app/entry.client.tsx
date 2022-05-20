import { RemixBrowser } from '@remix-run/react'
import { hydrate } from 'react-dom'
import lazySizes from 'lazysizes'

lazySizes.cfg.lazyClass = 'lazy'
hydrate(<RemixBrowser />, document)
