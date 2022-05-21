import { Profile } from '~/types'

type PreviewProps = {
	content: any
	profile: Profile
}

export default function Preview({ content, profile }: PreviewProps) {
	return (
		<>
			{content &&
				content.children.map((c: any, i: number) => (
					<div key={i}>
						{c.name === 'profile' && (
							<div>
								{c.attributes?.name && c.attributes?.name}
								{c.attributes?.bio && c.attributes?.bio}
							</div>
						)}
					</div>
				))}
		</>
	)
}
