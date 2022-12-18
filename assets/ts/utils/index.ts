export const getSize = (
	width: number,
	height: number,
	maxWidth: number,
	maxHeight: number
) => {
	const ratio = Math.min(maxWidth / width, maxHeight / height)
	return { width: width * ratio, height: height * ratio }
}

export const getIdealElementHeight = (pictureCount: number) => {
	return document.body.clientWidth && pictureCount < 2
		? 500
		: document.body.clientWidth > 2000 && pictureCount <= 4
		? 620
		: document.body.clientWidth < 1000 && pictureCount <= 4
		? 380
		: document.body.clientWidth < 700 && pictureCount <= 4
		? 280
		: 360
}

export const getContainerWidth = (pictureCount: number) => {
	return document.body.clientWidth > 2000 && pictureCount <= 2
		? 800
		: document.body.clientWidth > 2000 && pictureCount < 4
		? 1800
		: document.body.clientWidth > 3000
		? 2400
		: document.body.clientWidth
}
