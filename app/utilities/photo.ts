import { Photo, PhotoMetadata } from '~/types'
import piexif from 'piexifjs'

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

export let parseExif = (photo: string): Promise<PhotoMetadata> => {
	return new Promise((resolve) => {
		const exifObj = piexif.load(photo)
		const metadata: PhotoMetadata = {
			cameraMake: '',
			cameraModel: '',
			focalLength: '',
			lens: '',
			aperture: '',
			shutterSpeed: '',
			iso: '',
		}

		for (var ifd in exifObj) {
			if (ifd == 'thumbnail') {
				continue
			}
			for (var tag in exifObj[ifd]) {
				switch (piexif.TAGS[ifd][tag]['name']) {
					case 'Make':
						metadata.cameraMake = exifObj[ifd][tag]
						break
					case 'Model':
						metadata.cameraModel = exifObj[ifd][tag]
						break
					case 'FocalLength':
						metadata.focalLength = exifObj[ifd][tag]
						break
					case 'LensModel':
						metadata.lens = exifObj[ifd][tag].replace(/\0/g, '')
						break
					case 'FNumber':
						metadata.aperture = exifObj[ifd][tag]
						break
					case 'ExposureTime':
						metadata.shutterSpeed = exifObj[ifd][tag]
						break
					case 'ISOSpeedRatings':
						metadata.iso = exifObj[ifd][tag]
						break
					default:
						break
				}
			}
		}
		resolve(metadata)
	})
}

export let getPhotoSrcSet = (photo: Photo) => {
	const base = '/_moul/photos'
	return `${base}/${photo?.prefix}/${photo?.pid}/md 1024w,
	${base}/${photo?.prefix}/${photo?.pid}/xl 1440w`
}

export let getPhotoSrc = (photo: Photo) => {
	const base = '/_moul/photos'
	return `${base}/${photo?.prefix}/${photo?.pid}/xl`
}

export let getPhotoURL = (photo: Photo) => {
	const prefix = '/_moul/photos'

	return photo?.url ? `${photo.url}` : `${prefix}/${photo?.pid}/xl`
}
