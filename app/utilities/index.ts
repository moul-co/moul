import { toast, Slide } from 'react-toastify'

import { customAlphabet } from 'nanoid'
const customNanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12)

export { markdocConfig } from './markdoc'
export {
	getDimension,
	getPhotoSrc,
	getPhotoSrcSet,
	getPhotoURL,
	parseExif,
} from '~/utilities/photo'
export const isBrowser = () => typeof document !== 'undefined'
export const nanoid = () => customNanoid()
export const toastSuccess = (text: string) =>
	toast.success(text, {
		position: 'bottom-center',
		autoClose: 1500,
		hideProgressBar: true,
		closeOnClick: true,
		pauseOnHover: false,
		draggable: true,
		progress: 0,
		closeButton: false,
		transition: Slide,
		theme: 'dark',
	})

export const readFileAsync = (file: any) => {
	return new Promise((resolve) => {
		let fileReader = new FileReader()
		fileReader.onload = () => {
			resolve(fileReader.result)
		}
		fileReader.readAsDataURL(file)
	})
}
