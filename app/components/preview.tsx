import { Profile } from '~/components/story'

type PreviewProps = {
	content: any
	profile: any
}

export default function Preview({ content, profile }: PreviewProps) {
	const parseProfile = JSON.parse(profile)
	return (
		<>
			<Profile profile={parseProfile} />
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
