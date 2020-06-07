import { Injectable } from '@angular/core'
import { ReplaySubject } from 'rxjs'

export interface Photo {
	src: string
	srcHd: string
	sqip: string
	srcset: string
	name: string
	dimension: string
	color: string
	inline: object
	exif: {
		make: string
		model: string
		exposure_time: string
		aperture: string
		focal_length: string
		iso: string
		datetime: string
	}
}

@Injectable({
	providedIn: 'root',
})
export class AppService {
	collection: Photo[]
	photo = new ReplaySubject<Photo>(1)
	previous: string
	next: string
	routeTrigger = new ReplaySubject<object>(1)

	hideUI = true
	showExif = false

	constructor() {}

	getPhoto(name: string, { offsetEnter = 0, offsetLeave = 0 }): void {
		const index = this.collection.findIndex((p) => p.name === name)
		const previousIndex =
			index - 1 === -1 ? '' : this.collection[index - 1].name
		const nextIndex =
			index + 1 >= this.collection.length ? '' : this.collection[index + 1].name

		this.previous = previousIndex
		this.photo.next(this.collection[index])
		this.next = nextIndex
		this.hideUI = false

		this.routeTrigger.next({
			value: name,
			params: {
				offsetEnter,
				offsetLeave,
			},
		})
	}

	toggleUi(): void {
		this.hideUI = !this.hideUI
	}

	toggleInfo(): void {
		this.showExif = !this.showExif
	}
}
