import { Field } from "payload/types"
import { PluginOptions } from "../types"

export const crowdinArticleDirectoryFields = ({
  pluginOptions
}:{
  pluginOptions: PluginOptions
}): Field[] => [
  {
    name: "excludeLocales",
    type: "select",
    options: Object.keys(pluginOptions.localeMap),
    hasMany: true,
    admin: {
      description:
        "Select locales to exclude from translation synchronization.",
    },
  },
]
