import {
	ActivatedRouteSnapshot,
	DetachedRouteHandle,
	RouteReuseStrategy,
} from '@angular/router'

import { PhotoComponent } from './photo/photo.component'
import { Injectable } from '@angular/core'

@Injectable()
export class CustomReuseStrategy implements RouteReuseStrategy {
	handlers: { [key: string]: DetachedRouteHandle } = {}

	shouldDetach(route: ActivatedRouteSnapshot): boolean {
		return false
	}

	store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
		this.handlers[route.routeConfig.path] = null
	}

	shouldAttach(route: ActivatedRouteSnapshot): boolean {
		return !!route.routeConfig && !!this.handlers[route.routeConfig.path]
	}

	retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
		if (!route.routeConfig) {
			return null
		}
		return this.handlers[route.routeConfig.path]
	}

	shouldReuseRoute(
		future: ActivatedRouteSnapshot,
		curr: ActivatedRouteSnapshot
	): boolean {
		return curr.component !== PhotoComponent
	}
}
