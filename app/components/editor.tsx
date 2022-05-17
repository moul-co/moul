import {
	forwardRef,
	useRef,
	useEffect,
	useImperativeHandle,
	RefObject,
} from 'react'
import { markdown } from '@codemirror/lang-markdown'
import {
	keymap,
	highlightSpecialChars,
	drawSelection,
	highlightActiveLine,
	dropCursor,
	rectangularSelection,
	crosshairCursor,
	lineNumbers,
	highlightActiveLineGutter,
	EditorView,
} from '@codemirror/view'
import { Extension, EditorState, Text, Transaction } from '@codemirror/state'
import {
	defaultHighlightStyle,
	syntaxHighlighting,
	indentOnInput,
	bracketMatching,
	foldGutter,
	foldKeymap,
} from '@codemirror/language'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import {
	autocompletion,
	completionKeymap,
	closeBrackets,
	closeBracketsKeymap,
} from '@codemirror/autocomplete'
import { lintKeymap } from '@codemirror/lint'

type EditorProps = {
	initialValue?: string
	editorViewRef?: any
	onChange?: any
}

const Editor = forwardRef(
	(
		{
			initialValue = '',
			editorViewRef: editorViewRefProp,
			onChange,
		}: EditorProps,
		ref: any
	) => {
		const editorViewRefInternal = useRef()
		const containerRef = useRef() as any

		const editorViewRef = editorViewRefProp || editorViewRefInternal

		useImperativeHandle(ref, () => ({
			getValue: () => editorViewRef.current.state.doc.toString(),
			setValue: (value: string) => {
				editorViewRef.current.dispatch({ changes: { from: 0, insert: value } })
			},
			getActiveLine: () =>
				containerRef.current.querySelector('.cm-activeLineGutter').innerText,
		}))

		useEffect(() => {
			const updateListener = EditorView.updateListener.of((v) => {
				if (v.docChanged) {
					if (typeof onChange === 'function') {
						onChange()
					}
				}
			})

			if (containerRef.current) {
				if (!editorViewRef.current) {
					const extensions: Extension = [
						lineNumbers(),
						highlightActiveLineGutter(),
						highlightSpecialChars(),
						history(),
						foldGutter(),
						drawSelection(),
						dropCursor(),
						EditorState.allowMultipleSelections.of(true),
						indentOnInput(),
						syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
						bracketMatching(),
						closeBrackets(),
						autocompletion(),
						rectangularSelection(),
						crosshairCursor(),
						highlightActiveLine(),
						highlightSelectionMatches(),
						keymap.of([
							...closeBracketsKeymap,
							...defaultKeymap,
							...searchKeymap,
							...historyKeymap,
							...foldKeymap,
							...completionKeymap,
							...lintKeymap,
						]),
						updateListener,
						EditorView.theme(
							{
								'.cm-activeLine': {
									backgroundColor: '#232323',
								},
								'.cm-gutters': {
									backgroundColor: '#232323',
								},
								'.cm-scroller': {
									fontFamily:
										'VictorMono NF, Victor Mono, JetBrains Mono, Cascadia Code PL, monospace',
								},
								'&.cm-focused .cm-cursor': {
									borderLeftColor: '#ccc',
								},
							},
							{ dark: true }
						),
						markdown(),
					]
					editorViewRef.current = new EditorView({
						state: EditorState.create({
							doc: initialValue,
							extensions,
						}),
						parent: containerRef.current,
					})
				}
			}
		}, [containerRef, initialValue, editorViewRef, onChange])

		return <div className="w-full h-full" ref={containerRef} />
	}
)
export default Editor
