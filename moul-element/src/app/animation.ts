import {
	trigger,
	transition,
	group,
	query,
	style,
	animate,
} from '@angular/animations'

export const routeSlide = trigger('routeSlide', [
	transition('* <=> *', [
		group([
			query(
				':enter',
				[
					style({ transform: 'translateX({{offsetEnter}}%)' }),
					animate(
						'250ms cubic-bezier(.4,0,.2,1)',
						style({ transform: 'translateX(0%)' })
					),
				],
				{ optional: true }
			),
			query(
				':leave',
				[
					style({ transform: 'translateX(0%)' }),
					animate(
						'250ms cubic-bezier(.4,0,.2,1)',
						style({ transform: 'translateX({{offsetLeave}}%)' })
					),
				],
				{ optional: true }
			),
		]),
	]),
])
