import type {
  CollectionConfig,
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
} from 'payload'
import fetch from 'node-fetch'
import { extractYoutubeId, youtubeVideoUrl } from '../utils/youtube'
import CustomAdminError from '../errors/CustomAdminError'

interface Metadata {
  thumbnail_url: string
  title: string
  width: number
  height: number
}

const getMetadata = async (id: string): Promise<Metadata> => {
  const videoUrl: string = youtubeVideoUrl(id)
  const requestUrl: string = `https://youtube.com/oembed?url=${videoUrl}&format=json`
  const result = await fetch(requestUrl)
  if (result.status === 404) {
    throw new CustomAdminError(`Video with id ${id} not found on YouTube.`, 403)
  }
  return result.json() as Promise<Metadata>
}

const getBeforeValidateHook: CollectionBeforeValidateHook = async ({
  data, // incoming data to update or create with
  req, // full express request
  operation, // name of the operation ie. 'create', 'update'
}) => {
  if (operation === 'create') {
    // unique constraint not always working in tests - race conditions?
    const existing = await req.payload.find({
      collection: 'youtube-videos',
      where: {
        videoId: {
          equals: data?.videoId,
        },
      },
    })

    if (existing.totalDocs > 0) {
      throw new CustomAdminError(
        `Video with id ${data?.videoId} exists. Please select the existing video.`,
        409,
      )
    }
  }
  return data // Return data to either create or update a document with
}

const getBeforeChangeHook: CollectionBeforeChangeHook = async ({ data }) => {
  const metadata = await getMetadata(data.videoId)

  const thumbnailUrl = metadata.thumbnail_url
  const hqThumbnailUrl = `https://i3.ytimg.com/vi/${data.videoId}/maxresdefault.jpg`

  const hqThumbnail = await fetch(hqThumbnailUrl)

  return {
    ...data,
    oembed: metadata,
    title: metadata.title,
    aspectRatio: metadata.width / metadata.height,
    height: metadata.height,
    width: metadata.width,
    thumbnailUrl: hqThumbnail.status !== 404 ? hqThumbnailUrl : thumbnailUrl,
  }
}

const YoutubeVideos: CollectionConfig = {
  slug: 'youtube-videos',
  admin: {
    useAsTitle: 'title',
    listSearchableFields: ['title', 'videoId'],
    group: 'Shared',
    defaultColumns: ['title', 'videoId', 'updatedAt'],
    enableRichTextLink: false,
  },
  fields: [
    {
      name: 'videoId',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'YouTube video URL or video ID.',
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            return extractYoutubeId(value)
          },
        ],
      },
    },
    {
      name: 'thumbnail',
      type: 'relationship',
      relationTo: 'video-thumbnails',
    },
    {
      name: 'title',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'aspectRatio',
      type: 'number',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'width',
      type: 'number',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'height',
      type: 'number',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'thumbnailUrl',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'oembed',
      type: 'json',
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [getBeforeChangeHook, getBeforeValidateHook],
  },
}

export default YoutubeVideos
