import { Policy } from "@/payload-types";

export const fixture = {
        "root": {
            "children": [
                {
                    "children": [
                        {
                            "detail": 0,
                            "format": 0,
                            "mode": "normal",
                            "style": "",
                            "text": "Paragraph before YouTube video.",
                            "type": "text",
                            "version": 1
                        }
                    ],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": ""
                },
                {
                    "type": "relationship",
                    "version": 2,
                    "format": "",
                    "relationTo": "youtube-videos",
                    "value": {
                        "videoId": "jNQXAC9IVRw",
                        "title": "Me at the zoo",
                        "aspectRatio": 1.3333333333333333,
                        "width": 200,
                        "height": 150,
                        "thumbnailUrl": "https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg",
                        "oembed": {
                            "title": "Me at the zoo",
                            "author_name": "jawed",
                            "author_url": "https://www.youtube.com/@jawed",
                            "type": "video",
                            "height": 150,
                            "width": 200,
                            "version": "1.0",
                            "provider_name": "YouTube",
                            "provider_url": "https://www.youtube.com/",
                            "thumbnail_height": 360,
                            "thumbnail_width": 480,
                            "thumbnail_url": "https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg",
                            "html": "<iframe width=\"200\" height=\"150\" src=\"https://www.youtube.com/embed/jNQXAC9IVRw?feature=oembed\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen title=\"Me at the zoo\"></iframe>"
                        },
                        "createdAt": "2024-10-24T18:20:51.757Z",
                        "updatedAt": "2024-10-24T18:20:51.757Z",
                        "id": "671a9003910b067fc9bafa92"
                    }
                },
                {
                    "children": [
                        {
                            "detail": 0,
                            "format": 0,
                            "mode": "normal",
                            "style": "",
                            "text": "Paragraph after YouTube video.",
                            "type": "text",
                            "version": 1
                        }
                    ],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": ""
                }
            ],
            "direction": null,
            "format": "",
            "indent": 0,
            "type": "root",
            "version": 1
        }
    } as Policy['content']