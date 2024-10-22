import { PluginOptions } from "../types"

export const getOtherLocales = ({
  locale,
  localeMap,
}: {
  locale: string,
  localeMap: PluginOptions['localeMap']
}) => {
  const excludeLocales = Object.keys(localeMap)
  const thisLocaleIndex = locale ? excludeLocales.indexOf(locale) : -1
  if (thisLocaleIndex !== -1) {
    excludeLocales.splice(thisLocaleIndex, 1)
  }
  return excludeLocales
}
