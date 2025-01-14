import { TaskConfig } from "payload"
import { updatePayloadTranslation } from "../api/helpers"
import { PluginOptions } from "../types"

export const syncTranslations = ({ pluginOptions }: { pluginOptions: PluginOptions}): TaskConfig<'crowdinSyncTranslations'> => ({
  // Configure this task to automatically retry
  // up to two times
  retries: 2,

  // This is a unique identifier for the task

  slug: 'crowdinSyncTranslations',

  // These are the arguments that your Task will accept
  inputSchema: [
    {
      name: 'articleDirectoryId',
      type: 'text',
      required: true,
    },
    {
      name: 'draft',
      type: 'checkbox',
    },
    {
      name: 'excludeLocales',
      type: 'select',
      options: Object.keys(pluginOptions.localeMap),
      hasMany: true,
    },
    {
      name: 'dryRun',
      type: 'checkbox',
    },
  ],

  // These are the properties that the function should output
  outputSchema: [
    {
      name: 'result',
      type: 'json',
    },
  ],

  // This is the function that is run when the task is invoked
  handler: async ({ input, req }) => {
    const result = await updatePayloadTranslation({
      articleDirectoryId: input.articleDirectoryId,
      pluginOptions,
      payload: req.payload,
      draft: input.draft,
      excludeLocales: input.excludeLocales,
      dryRun: false,
      req,
    })
    if (process.env.PAYLOAD_CROWDIN_SYNC_VERBOSE) {
      console.log(result)
    }
    return {
      output: {
        result,
      },
    }
  },
})
