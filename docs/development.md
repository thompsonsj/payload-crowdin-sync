# nock

Testing with `nock` can become quite complex.

For failing tests involving nock, consider outputting all the Crowdin API calls by:

- `console.log` the fetch call in 
- add `console.log` calls as necessary in `node_modules/@crowdin/crowdin-api-client`. 

```
// updates a Payload article with a rich text field that uses the Lexical editor with multiple blocks with a translation received from Crowdin

https://api.crowdin.com/api/v2/projects/323731/translations/builds/files/56641
https://api.crowdin.com/api/v2/projects/323731/translations/builds/56641/download?targetLanguageId=de

https://api.crowdin.com/api/v2/projects/323731/translations/builds/files/56644
https://api.crowdin.com/api/v2/projects/323731/translations/builds/56644/download?targetLanguageId=de

https://api.crowdin.com/api/v2/projects/323731/translations/builds/files/56641
https://api.crowdin.com/api/v2/projects/323731/translations/builds/56641/download?targetLanguageId=fr

https://api.crowdin.com/api/v2/projects/323731/translations/builds/files/56644
https://api.crowdin.com/api/v2/projects/323731/translations/builds/56644/download?targetLanguageId=fr
```