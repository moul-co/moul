export { markdocConfig } from './markdoc'
export {
	getDimension,
	getPhotoSrc,
	getPhotoSrcSet,
	getPhotoURL,
	parseExif,
} from '~/utilities/photo'
export const isBrowser = () => typeof window !== 'undefined'
