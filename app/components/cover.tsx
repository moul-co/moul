import { getPhotoSrcSet, Photo } from '~/utils'

export const Cover = ({ photo }: { photo: Photo }) => {
	return (
		<picture className="absolute top-0 left-0 w-full h-full">
			{photo.bh ? (
				<img
					src={`data:image/jpeg;charset=utf-8;base64,${photo.bh}`}
					data-srcset={getPhotoSrcSet(photo)}
					data-sizes="auto"
					className="lazy w-full h-full object-cover"
					alt="Cover"
				/>
			) : (
				<img
					src={photo.url}
					data-sizes="auto"
					className="lazy w-full h-full object-cover"
					alt="Cover"
				/>
			)}
		</picture>
	)
}
