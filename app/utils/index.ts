export const isBrowser = () => typeof window !== 'undefined'
/**
 * Maintain aspect ratio on scale size
 *
 * @param width current width of image
 * @param height current height of image
 * @param maxWidth scale max width
 * @param maxHeight scale max height
 * @returns { width, height }
 */
export let getDimension = (
	width: number,
	height: number,
	maxWidth: number,
	maxHeight: number
) => {
	const ratio = Math.min(maxWidth / width, maxHeight / height)
	return { width: width * ratio, height: height * ratio }
}

export interface Photo {
	order: number
	hash: string
	bh: string
	width: number
	height: number
	type: string
	url: string
}

export let getPhotoSrcSet = (photo: any) => {
	const prefix = '/__moul/photos'
	return `${prefix}/${photo?.hash}/sm/${photo?.fn} 320w,
	${prefix}/${photo?.hash}/md/${photo?.fn} 768w,
	${prefix}/${photo?.hash}/lg/${photo?.fn} 1024w,
	${prefix}/${photo?.hash}/xl/${photo?.fn} 1440w`
}

export default {
	isBrowser,
}
