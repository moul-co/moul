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

	console.log('MOUL_PROFILE_NAME', process.env.MOUL_PROFILE_NAME)
	let profile = {
		name: process.env.MOUL_PROFILE_NAME,
		bio: process.env.MOUL_PROFILE_BIO,
		social: {
			twitter: process.env.MOUL_PROFILE_SOCIAL_TWITTER,
			github: process.env.MOUL_PROFILE_SOCIAL_GITHUB,
			youtube: process.env.MOUL_PROFILE_SOCIAL_YOUTUBE,
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
