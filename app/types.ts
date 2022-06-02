export interface PhotoMetadata {
	cameraMake: string
	cameraModel: string
	focalLength: string
	aperture: string
	shutterSpeed: string
	iso: string
	lens: string
}
export interface Photo {
	name: string
	pid: string
	order: number
	blurhash: string
	width: number
	height: number
	prefix: string
	url: string
	metadata?: PhotoMetadata
	contentType?: string
	timestamp?: number
}

export interface Profile {
	name: string
	bio: string
	github: string
	twitter: string
	youtube: string
	instagram: string
	facebook: string
	picture: Photo | null
	cover: Photo | null
}
