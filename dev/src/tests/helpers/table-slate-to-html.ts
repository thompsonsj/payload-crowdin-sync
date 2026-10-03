import type { SlateToHtmlConfig } from '@slate-serializers/html'
import { payloadSlateToHtmlConfig } from '@slate-serializers/html'

/**
 * Slate-to-HTML map used by the custom-serializers integration test.
 */
export const tableSlateToHtmlConfig: SlateToHtmlConfig = {
  ...payloadSlateToHtmlConfig,
  elementMap: {
    ...payloadSlateToHtmlConfig.elementMap,
    table: 'table',
    ['table-body']: 'tbody',
    ['table-header']: 'thead',
    ['table-header-cell']: 'th',
    ['table-row']: 'tr',
    ['table-cell']: 'td',
  },
}
