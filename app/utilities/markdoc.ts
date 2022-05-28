export const markdocConfig = {
	tags: {
		title: {
			render: 'title',
			children: ['paragraph'],
		},
		profile: {
			render: 'profile',
			attributes: {
				name: {
					type: String,
					description: 'Profile name',
				},
				bio: {
					type: String,
					description: 'Profile bio',
				},
				social: {
					type: Object,
					description: 'Profile social handle',
				},
			},
		},
		photo: {
			render: 'photo',
			attributes: {
				pid: {
					type: String,
					description: 'Photo ID',
				},
				metadata: {
					type: Object,
					description: 'Metadata of photo',
				},
			},
		},
		grid: {
			render: 'grid',
			description: 'Display grid of photos',
			children: ['tag'],
		},
	},
}
