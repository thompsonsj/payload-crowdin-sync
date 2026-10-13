/**
 * SerializedLexicalNode is a closed base type. Tests inspect
 * paragraph children, block fields, etc. via this cast.
 */
export const asNode = <T>(node: unknown): T => node as T;
