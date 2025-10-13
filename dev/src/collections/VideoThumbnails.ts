import type { CollectionConfig } from 'payload'

const VideoThumbnails: CollectionConfig = {
  slug: 'video-thumbnails',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Libraries',
    enableRichTextLink: false,
    enableRichTextRelationship: false,
  },
  upload: {
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 225,
        position: 'centre',
      },
      {
        name: 'widescreen',
        width: 1200,
        height: 675,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  fields: [],
}

export default VideoThumbnails
