export interface Photo {
	name: string
	order: number
	hash: string
	bh: string
	width: number
	height: number
	type: string
	url: string
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
