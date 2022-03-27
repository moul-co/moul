import { json, useLoaderData } from 'remix'
import Stories from '~/components/stories'

import * as s1 from '~/routes/virachey-the-raw-beauty-of-nature.mdx'
import * as s2 from '~/routes/sunset-at-its-finest.mdx'
import { Profile } from '~/components/profile'

function storyFromModule(mod: any) {
	return {
		slug: mod.filename.replace(/\.mdx?$/, ''),
		...mod.attributes.meta,
	}
}
export async function loader() {
	let stories = [storyFromModule(s1), storyFromModule(s2)].reverse()
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
		stories,
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
