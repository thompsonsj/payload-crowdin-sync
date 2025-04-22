import { Policy } from "../../payload-types"

export const image = {
        "createdAt": "2025-04-22T17:57:12.961Z",
        "updatedAt": "2025-04-22T17:57:12.961Z",
        "filename": "cristian-palmer-XexawgzYOBc-unsplash.jpg",
        "mimeType": "image/jpeg",
        "filesize": 1491638,
        "width": 4000,
        "height": 3000,
        "focalX": 50,
        "focalY": 50,
        
        "sizes": {
        
        "thumbnail": {
        "width": 400,
        "height": 300,
        "mimeType": "image/jpeg",
        "filesize": 13898,
        "filename": "cristian-palmer-XexawgzYOBc-unsplash-400x300.jpg",
        "url": "/api/media/file/cristian-palmer-XexawgzYOBc-unsplash-400x300.jpg"
        },
        
        "card": {
        "width": 768,
        "height": 1024,
        "mimeType": "image/jpeg",
        "filesize": 85547,
        "filename": "cristian-palmer-XexawgzYOBc-unsplash-768x1024.jpg",
        "url": "/api/media/file/cristian-palmer-XexawgzYOBc-unsplash-768x1024.jpg"
        },
        
        "tablet": {
        "width": 1024,
        "height": 768,
        "mimeType": "image/jpeg",
        "filesize": 76596,
        "filename": "cristian-palmer-XexawgzYOBc-unsplash-1024x768.jpg",
        "url": "/api/media/file/cristian-palmer-XexawgzYOBc-unsplash-1024x768.jpg"
        }
        },
        "id": "6807d8788f035087f555ee40",
        "url": "/api/media/file/cristian-palmer-XexawgzYOBc-unsplash.jpg",
        "thumbnailURL": "/api/media/file/cristian-palmer-XexawgzYOBc-unsplash-400x300.jpg"
}

export const fixture = (mediaId: string = "6807d878f8296947487161eb") => ({
    "root": {
        "children": [
            {
                "children": [
                    {
                        "detail": 0,
                        "format": 0,
                        "mode": "normal",
                        "style": "",
                        "text": "What happens if a block doesn't have any localized fields?",
                        "type": "text",
                        "version": 1
                    }
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "type": "paragraph",
                "version": 1,
                "textFormat": 0,
                "textStyle": ""
            },
            {
                "type": "block",
                "version": 2,
                "format": "",
                "fields": {
                    "id": "678564c06ec4a6f1fcf6a623",
                    "blockName": "",
                    "cookieCategoryId": "strictlyNecessary",
                    "blockType": "cookieTable"
                }
            },
            {
                "children": [
                    {
                        "detail": 0,
                        "format": 0,
                        "mode": "normal",
                        "style": "",
                        "text": "For example - a block that only contains a select field, which is included twice for good measure!",
                        "type": "text",
                        "version": 1
                    }
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "type": "paragraph",
                "version": 1,
                "textFormat": 0,
                "textStyle": ""
            },
            {
                "type": "block",
                "version": 2,
                "format": "",
                "fields": {
                    "id": "678564926ec4a6f1fcf6a622",
                    "blockName": "",
                    "cookieCategoryId": "functional",
                    "blockType": "cookieTable"
                }
            },
            {
                "children": [
                    {
                        "detail": 0,
                        "format": 0,
                        "mode": "normal",
                        "style": "",
                        "text": "Also, can we include images and expect those to be included in the final version?",
                        "type": "text",
                        "version": 1
                    }
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "type": "paragraph",
                "version": 1,
                "textFormat": 0,
                "textStyle": ""
            },
            {
                "children": [],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "paragraph",
                "version": 1,
                "textFormat": 0,
                "textStyle": ""
            },
            {
                "type": "upload",
                "version": 3,
                "format": "",
                "id": "6807d878f8296947487161eb",
                "fields": null,
                "relationTo": "media",
                "value": {
                    "createdAt": "2025-04-22T17:57:12.961Z",
                    "updatedAt": "2025-04-22T17:57:12.961Z",
                    "filename": "cristian-palmer-XexawgzYOBc-unsplash.jpg",
                    "mimeType": "image/jpeg",
                    "filesize": 1491638,
                    "width": 4000,
                    "height": 3000,
                    "focalX": 50,
                    "focalY": 50,
                    "sizes": {
                        "thumbnail": {
                            "width": 400,
                            "height": 300,
                            "mimeType": "image/jpeg",
                            "filesize": 13898,
                            "filename": "cristian-palmer-XexawgzYOBc-unsplash-400x300.jpg",
                            "url": "/api/media/file/cristian-palmer-XexawgzYOBc-unsplash-400x300.jpg"
                        },
                        "card": {
                            "width": 768,
                            "height": 1024,
                            "mimeType": "image/jpeg",
                            "filesize": 85547,
                            "filename": "cristian-palmer-XexawgzYOBc-unsplash-768x1024.jpg",
                            "url": "/api/media/file/cristian-palmer-XexawgzYOBc-unsplash-768x1024.jpg"
                        },
                        "tablet": {
                            "width": 1024,
                            "height": 768,
                            "mimeType": "image/jpeg",
                            "filesize": 76596,
                            "filename": "cristian-palmer-XexawgzYOBc-unsplash-1024x768.jpg",
                            "url": "/api/media/file/cristian-palmer-XexawgzYOBc-unsplash-1024x768.jpg"
                        }
                    },
                    "id": mediaId,
                    "url": "/api/media/file/cristian-palmer-XexawgzYOBc-unsplash.jpg",
                    "thumbnailURL": "/api/media/file/cristian-palmer-XexawgzYOBc-unsplash-400x300.jpg"
                }
            },
            {
                "children": [
                    {
                        "detail": 0,
                        "format": 0,
                        "mode": "normal",
                        "style": "",
                        "text": "Some final paragraph text - for good measure (overused phrase at this point).",
                        "type": "text",
                        "version": 1
                    }
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "type": "paragraph",
                "version": 1,
                "textFormat": 0,
                "textStyle": ""
            }
        ],
        "direction": "ltr",
        "format": "",
        "indent": 0,
        "type": "root",
        "version": 1
    }
})  as Policy['content']