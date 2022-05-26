import { Cover, Profile } from '~/components/story'

type PreviewProps = {
	content: any
	profile: any
}

export default function Preview({ content, profile }: PreviewProps) {
	return (
		<>
			<div className="relative w-full h-96">
				<Cover photo={profile.cover} />
			</div>
			<Profile profile={profile} />
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
