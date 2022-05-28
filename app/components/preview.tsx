import { Cover, Profile } from '~/components/story'

type PreviewProps = {
	content: any
	profile: any
}

export default function Preview({ content, profile }: PreviewProps) {
	let title = content && content.children.find((c: any) => c.name === 'title')

	return (
		<>
			<div className="relative w-full h-96">
				<Cover photo={profile.cover} />
			</div>
			<Profile profile={profile} />
			{title && (
				<div className="moul-content-title mx-auto font-bold max-w-3xl mb-6 text-neutral-900 dark:text-neutral-50 px-6 xs:px-0">
					<h1 className="text-3xl md:text-5xl">
						{title.children[0].children[0]}
					</h1>
				</div>
			)}
			{content &&
				content.children.map((c: any, i: number) => (
					<div className="mx-auto" key={i}>
						{c.name === 'p' && (
							<p className="px-6 xs:px-0 text-lg md:text-xl max-w-3xl mx-auto my-8 md:my-10 text-neutral-700 dark:text-neutral-200">
								{c.children[0]}
							</p>
						)}
						{c.name === 'h1' && (
							<h2 className="px-6 xs:px-0 text-2xl md:text-3xl font-bold sm:text-4xl max-w-3xl mx-auto my-8 md:my-10 text-neutral-800 dark:text-neutral-100">
								{c.children[0]}
							</h2>
						)}
						{c.name === 'h2' && (
							<h3 className="px-6 xs:px-0 text-xl md:text-2xl font-bold sm:text-3xl max-w-3xl mx-auto my-8 md:my-10 text-neutral-800 dark:text-neutral-100">
								{c.children[0]}
							</h3>
						)}
						{c.name === 'h3' && (
							<h4 className="px-6 xs:px-0 text-xl md:text-xl font-bold sm:text-2xl max-w-3xl mx-auto my-8 md:my-10 text-neutral-800 dark:text-neutral-100">
								{c.children[0]}
							</h4>
						)}
						{c.name === 'blockquote' && (
							<blockquote className="px-6 xs:px-0 text-lg md:text-xl max-w-3xl mx-auto my-8 md:my-10 text-neutral-800 border-neutral-800 dark:text-neutral-400 dark:border-neutral-400 border-l-4 pl-4">
								{c.children[0].children[0]}
							</blockquote>
						)}
					</div>
				))}
		</>
	)
}
