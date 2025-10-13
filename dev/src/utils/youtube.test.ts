import { extractYoutubeId } from './youtube'

describe('fn: extractYoutubeId', () => {
  // @see
  const fixtures = [
    {
      input: 'https://youtube.com/shorts/dQw4w9WgXcQ?feature=share',
      output: 'dQw4w9WgXcQ',
    },
    {
      input: '//www.youtube-nocookie.com/embed/up_lNV-yoK4?rel=0',
      output: 'up_lNV-yoK4',
    },
    {
      input: 'http://www.youtube.com/user/Scobleizer#p/u/1/1p3vcRhsYGo',
      output: '1p3vcRhsYGo',
    },
    {
      input: 'http://www.youtube.com/watch?v=cKZDdG9FTKY&feature=channel',
      output: 'cKZDdG9FTKY',
    },
    {
      input:
        'http://www.youtube.com/watch?v=yZ-K7nCVnBI&playnext_from=TL&videos=osPknwzXEas&feature=sub',
      output: 'yZ-K7nCVnBI',
    },
    {
      input: 'http://www.youtube.com/ytscreeningroom?v=NRHVzbJVx8I',
      output: 'NRHVzbJVx8I',
    },
    {
      input: 'http://www.youtube.com/user/SilkRoadTheatre#p/a/u/2/6dwqZw0j_jY',
      output: '6dwqZw0j_jY',
    },
    {
      input: 'http://youtu.be/6dwqZw0j_jY',
      output: '6dwqZw0j_jY',
    },
    {
      input: 'http://www.youtube.com/watch?v=6dwqZw0j_jY&feature=youtu.be',
      output: '6dwqZw0j_jY',
    },
    {
      input: 'http://youtu.be/afa-5HQHiAs',
      output: 'afa-5HQHiAs',
    },
    {
      input: 'http://www.youtube.com/user/Scobleizer#p/u/1/1p3vcRhsYGo?rel=0',
      output: '1p3vcRhsYGo',
    },
    {
      input: 'http://www.youtube.com/watch?v=cKZDdG9FTKY&feature=channel',
      output: 'cKZDdG9FTKY',
    },
    {
      input:
        'http://www.youtube.com/watch?v=yZ-K7nCVnBI&playnext_from=TL&videos=osPknwzXEas&feature=sub',
      output: 'yZ-K7nCVnBI',
    },
    {
      input: 'http://www.youtube.com/ytscreeningroom?v=NRHVzbJVx8I',
      output: 'NRHVzbJVx8I',
    },
    {
      input: 'http://www.youtube.com/embed/nas1rJpm7wY?rel=0',
      output: 'nas1rJpm7wY',
    },
    {
      input: 'http://www.youtube.com/watch?v=peFZbP64dsU',
      output: 'peFZbP64dsU',
    },
    {
      input: 'http://youtube.com/v/dQw4w9WgXcQ?feature=youtube_gdata_player',
      output: 'dQw4w9WgXcQ',
    },
    {
      input: 'http://youtube.com/vi/dQw4w9WgXcQ?feature=youtube_gdata_player',
      output: 'dQw4w9WgXcQ',
    },
    {
      input: 'http://youtube.com/?v=dQw4w9WgXcQ&feature=youtube_gdata_player',
      output: 'dQw4w9WgXcQ',
    },
    {
      input: 'http://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=youtube_gdata_player',
      output: 'dQw4w9WgXcQ',
    },
    {
      input: 'http://youtube.com/?vi=dQw4w9WgXcQ&feature=youtube_gdata_player',
      output: 'dQw4w9WgXcQ',
    },
    {
      input: 'http://youtube.com/watch?v=dQw4w9WgXcQ&feature=youtube_gdata_player',
      output: 'dQw4w9WgXcQ',
    },
    {
      input: 'http://youtube.com/watch?vi=dQw4w9WgXcQ&feature=youtube_gdata_player',
      output: 'dQw4w9WgXcQ',
    },
    {
      input: 'http://youtu.be/dQw4w9WgXcQ?feature=youtube_gdata_player',
      output: 'dQw4w9WgXcQ',
    },
  ]

  it.each(fixtures)('extracts a video ID from a YouTube URL', ({ input, output }) => {
    expect(extractYoutubeId(input)).toEqual(output)
  })
})
