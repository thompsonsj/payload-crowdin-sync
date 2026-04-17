/**
 * Stub for `file-type` in Jest. Payload imports it from upload helpers; the real package is ESM
 * with a dependency chain that Jest does not transform reliably. Plugin unit tests do not need
 * magic-byte file detection.
 */
module.exports = {
  fileTypeFromFile: async () => undefined,
}
