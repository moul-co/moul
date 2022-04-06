import { hydrate } from 'react-dom'
import { RemixBrowser } from 'remix'
import lazySizes from 'lazysizes'
lazySizes.cfg.lazyClass = 'lazy'

hydrate(<RemixBrowser />, document)
