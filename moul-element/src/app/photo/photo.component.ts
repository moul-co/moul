import { Component } from '@angular/core'
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router'
import { AppService } from 'src/app/app.service'

@Component({
	selector: 'app-photo',
	templateUrl: './photo.component.html',
	styleUrls: ['./photo.component.css'],
})
export class PhotoComponent {
	public name: string

	constructor(
		private r: Router,
		public ar: ActivatedRoute,
		public appService: AppService
	) {
		this.r.events.subscribe((event) => {
			if (event instanceof NavigationEnd) {
				if (event.url === '/') {
					this.appService.hideUI = true
					this.appService.showExif = false
				}
				if ((<any>window).gtag && appService.measurementId) {
					;(<any>window).gtag('config', appService.measurementId, {
						page_path: window.location.pathname,
					})
				}
			}
		})
		this.ar.params.subscribe((p) => {
			const { offsetEnter, offsetLeave } = history.state
			this.appService.getPhoto(p.name ? p.name : '', {
				offsetEnter,
				offsetLeave,
			})
		})
	}
}
