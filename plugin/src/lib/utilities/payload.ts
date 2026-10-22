/**
 * A relationship value is either a populated document or an unpopulated id
 * (a string on MongoDB, a number on SQL adapters).
 */
export const isPopulatedRelationship = <T extends object>(
  val: T | string | number | undefined | null,
): val is T => typeof val === 'object' && val !== null;

export const getRelationshipId = (
  relationship?: string | number | { id: string | number } | null,
): string | number | undefined => {
  if (relationship === undefined || relationship === null) {
    return undefined;
  }
  if (isPopulatedRelationship(relationship)) {
    return relationship.id;
  }
  return relationship;
};
