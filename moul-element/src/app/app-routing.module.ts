import { NgModule } from '@angular/core'
import { Routes, RouterModule, RouteReuseStrategy } from '@angular/router'

import { CustomReuseStrategy } from './app-routing-reuse-strategy'
import { PhotoComponent } from './photo/photo.component'

const routes: Routes = [{ path: ':name', component: PhotoComponent }]

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	providers: [
		{
			provide: RouteReuseStrategy,
			useClass: CustomReuseStrategy,
		},
	],
	exports: [RouterModule],
})
export class AppRoutingModule {}
