import { cloneElement, useState } from 'react'
import {
	Placement,
	offset,
	flip,
	shift,
	autoUpdate,
	useFloating,
	useInteractions,
	useHover,
	useFocus,
	useRole,
	useDismiss,
} from '@floating-ui/react-dom-interactions'

interface Props {
	label: string
	placement?: Placement
	children: JSX.Element
}

export const Tooltip = ({ children, label, placement = 'top' }: Props) => {
	const [open, setOpen] = useState(false)

	const { x, y, reference, floating, strategy, context } = useFloating({
		placement,
		open,
		onOpenChange: setOpen,
		middleware: [offset(3), flip(), shift({ padding: 4 })],
		whileElementsMounted: autoUpdate,
	})

	const { getReferenceProps, getFloatingProps } = useInteractions([
		useHover(context),
		useFocus(context),
		useRole(context, { role: 'tooltip' }),
		useDismiss(context),
	])

	return (
		<>
			{cloneElement(
				children,
				getReferenceProps({ ref: reference, ...children.props })
			)}
			{open && (
				<div
					className=""
					{...getFloatingProps({
						ref: floating,
						className:
							'w-fit bg-black px-2 rounded-md bg-red-500 text-neutral-50 leading-none pt-1 pb-2',
						style: {
							position: strategy,
							top: y ?? '',
							left: x ?? '',
						},
					})}
				>
					{label}
				</div>
			)}
		</>
	)
}
