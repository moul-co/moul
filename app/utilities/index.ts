export { markdocConfig } from './markdoc'
export {
	getDimension,
	getPhotoSrc,
	getPhotoSrcSet,
	getPhotoURL,
	parseExif,
	processPhoto,
} from '~/utilities/photo'
export const isBrowser = () => typeof window !== 'undefined'
