export { markdocConfig } from './markdoc'
export {
	getDimension,
	getPhotoSrc,
	getPhotoSrcSet,
	getPhotoURL,
	parseExif,
	processPhoto,
	processPhotoWithSize,
} from '~/utilities/photo'
export const isBrowser = () => typeof window !== 'undefined'
