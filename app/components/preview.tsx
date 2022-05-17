type PreviewProps = {
	content: any
}

export default function Preview({ content }: PreviewProps) {
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
