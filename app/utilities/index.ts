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
export const createHash = async (message: string) => {
	const encoder = new TextEncoder()
	const data = encoder.encode(message)
	const hash = await crypto.subtle.digest('SHA-1', data)
	const hashArray = Array.from(new Uint8Array(hash))
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}
