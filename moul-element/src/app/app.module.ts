import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { PhotoComponent } from './photo/photo.component'

@NgModule({
	declarations: [AppComponent, PhotoComponent],
	imports: [BrowserModule, BrowserAnimationsModule, AppRoutingModule],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
