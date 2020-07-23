import {
	Component,
	OnInit,
	ViewChild,
	ElementRef,
	AfterViewInit,
} from '@angular/core'
import { Router, NavigationEnd } from '@angular/router'
import { fromEvent } from 'rxjs'
import { debounceTime } from 'rxjs/operators'

import { fixed_partition } from 'image-layout'
import lazySizes from 'lazysizes'
import { AppService, Photo } from './app.service'
import { routeSlide } from './animation'

@Component({
	selector: 'moul-collection',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
	animations: [routeSlide],
	host: {
		'(document:keydown)': 'key($event)',
	},
})
export class AppComponent implements OnInit, AfterViewInit {
	private photos: any[]
	container = {}
	showBackdrop = false
	hideUI = true
	by: string

	@ViewChild('next') next: ElementRef<HTMLElement>
	@ViewChild('previous') previous: ElementRef<HTMLElement>

	constructor(private r: Router, public appService: AppService) {
		this.r.events.subscribe((event) => {
			if (event instanceof NavigationEnd) {
				if (event.url !== '/') {
					this.showBackdrop = true
				} else {
					this.showBackdrop = false
				}
			}
		})
	}

	ngOnInit(): void {
		const pi = document.querySelector('#photos') as HTMLInputElement
		const measurementId = document.querySelector(
			'#ga-measurement-id'
		) as HTMLInputElement
		const exif = document.querySelector('#exif') as HTMLInputElement
		const by = document.querySelector('#by') as HTMLInputElement
		this.by = by.value

		if (measurementId.value) {
			this.appService.measurementId = measurementId.value
		}
		if (exif.value == 'false') {
			this.appService.exif = false
		}

		this.photos = JSON.parse(pi.value)

		this.calculate()

		fromEvent(window, 'resize')
			.pipe(debounceTime(250))
			.subscribe((event) => {
				this.calculate()
			})
	}

	ngAfterViewInit(): void {
		lazySizes.init()
	}

	calculate() {
		const containerWidth = window.innerWidth - 16
		const idealElementHeight = 350

		const layout = fixed_partition(this.photos, {
			containerWidth,
			idealElementHeight,
			spacing: 8,
		})
		let calculated = []
		layout.positions.map((_, i: number) => {
			const srcHd = this.photos[i].id
				? `photos/${this.photos[i].id}/collection/2048/${this.photos[i].name}-by-${this.by}.jpg`
				: `photos/collection/${this.photos[i].src}`
			const src = this.photos[i].id
				? `photos/${this.photos[i].id}/collection/750/${this.photos[i].name}-by-${this.by}.jpg`
				: `photos/collection/${this.photos[i].src}`
			const sqip = this.photos[i].id
				? `photos/${this.photos[i].id}/collection/sqip/${this.photos[i].name}-by-${this.by}.svg`
				: ''

			calculated.push({
				src,
				srcHd,
				sqip,
				srcset: this.photos[i].srcset,
				name: this.photos[i].name,
				dimension: `${this.photos[i].width_hd}x${this.photos[i].height_hd}`,
				color: this.photos[i].color,
				inline: {
					'width.px': layout.positions[i].width,
					'height.px': layout.positions[i].height,
					'top.px': layout.positions[i].y,
					'left.px': layout.positions[i].x,
					background: this.photos[i].color || '',
				},
				exif: {
					make: this.photos[i].exif.make ? this.photos[i].exif.make : 'N/A',
					model: this.photos[i].exif.model ? this.photos[i].exif.model : 'N/A',
					exposure_time: this.photos[i].exif.exposure_time
						? this.photos[i].exif.exposure_time
						: 'N/A',
					aperture: this.photos[i].exif.aperture
						? this.photos[i].exif.aperture
						: 'N/A',
					focal_length: this.photos[i].exif.focal_length
						? this.photos[i].exif.focal_length
						: 'N/A',
					iso: this.photos[i].exif.iso ? this.photos[i].exif.iso : 'N/A',
				},
			})
		})

		this.appService.collection = calculated as Photo[]
		this.container = {
			'width.px': layout.width,
			'height.px': layout.height,
		}
	}

	key(event: KeyboardEvent): void {
		if (window.location.pathname !== '/') {
			switch (event.keyCode) {
				case 27:
					this.r.navigateByUrl('/')
					break
				case 39:
					this.r.navigate([this.appService.next], {
						state: { offsetEnter: 100, offsetLeave: -100 },
					})
					break
				case 37:
					this.r.navigate([this.appService.previous], {
						state: { offsetEnter: -100, offsetLeave: 100 },
					})
					break
			}
		}
	}
}
