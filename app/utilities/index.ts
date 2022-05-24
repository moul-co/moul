import { customAlphabet } from 'nanoid'
const customNanoid = customAlphabet(
	'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
	21
)

export { markdocConfig } from './markdoc'
export {
	getDimension,
	getPhotoSrc,
	getPhotoSrcSet,
	getPhotoURL,
	parseExif,
} from '~/utilities/photo'
export const isBrowser = () => typeof window !== 'undefined'
export const nanoid = () => customNanoid()
