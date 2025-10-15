export const youtubeVideoUrl = (videoId: string) => `https://www.youtube.com/watch?v=${videoId}`

const regex =
  /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/

export const extractYoutubeId = (url: string) => {
  if (!url.includes('/')) {
    return url
  }
  const r = url.match(regex)
  return r && r[1]
}
