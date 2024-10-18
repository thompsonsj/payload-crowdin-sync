import { CrowdinArticleDirectory } from "../payload-types";

export const isNotString = <T>(val: T | string | undefined | null): val is T => {
  return val !== undefined && val !== null && typeof val !== 'string';
};

export const getRelationshipId = (relationship?: string | CrowdinArticleDirectory | null) => {
  if (!relationship) {
    return undefined
  }
  if (isNotString(relationship)) {
    return relationship.id
  }
  return relationship
}
