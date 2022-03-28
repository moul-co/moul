import { json, useLoaderData } from 'remix'
import Stories from '~/components/stories'

import { Profile } from '~/components/profile'

export async function loader() {
	// let stories = getStories()
	let {
		MOUL_PROFILE_NAME,
		MOUL_PROFILE_BIO,
		MOUL_PROFILE_SOCIAL_TWITTER,
		MOUL_PROFILE_SOCIAL_GITHUB,
		MOUL_PROFILE_SOCIAL_YOUTUBE,
	} = process.env
	let profile = {
		name: MOUL_PROFILE_NAME,
		bio: MOUL_PROFILE_BIO,
		social: {
			twitter: MOUL_PROFILE_SOCIAL_TWITTER,
			github: MOUL_PROFILE_SOCIAL_GITHUB,
			youtube: MOUL_PROFILE_SOCIAL_YOUTUBE,
		},
	}

	return json({
		profile,
		// stories,
	})
}

export default function Index() {
	const { profile, stories } = useLoaderData()
	console.log(profile)
	return (
		<div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
			<h1>Hey, Hello</h1>
			<Profile profile={profile} />
			<Stories stories={stories} />
		</div>
	)
}
