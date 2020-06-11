import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { PhotoComponent } from './photo.component'

describe('PhotoComponent', () => {
	let component: PhotoComponent
	let fixture: ComponentFixture<PhotoComponent>

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [PhotoComponent],
		}).compileComponents()
	}))

	beforeEach(() => {
		fixture = TestBed.createComponent(PhotoComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})
})
