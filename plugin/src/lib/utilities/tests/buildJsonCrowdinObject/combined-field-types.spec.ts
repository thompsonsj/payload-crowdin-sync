import type { CollectionConfig, Field } from "payload";
import { buildCrowdinJsonObject, getLocalizedFields } from "../..";

describe("fn: buildCrowdinJsonObject: group nested in array", () => {
  const doc = {
    id: "6474a81bef389b66642035ff",
    title: "Experience the magic of our product!",
    text: "Get in touch with us or try it out yourself",
    ctas: [
      {
        link: {
          text: "Talk to us",
          href: "#",
          type: "ctaPrimary",
        },
        id: "6474a80221baea4f5f169757",
      },
      {
        link: {
          text: "Try for free",
          href: "#",
          type: "ctaSecondary",
        },
        id: "6474a81021baea4f5f169758",
      },
    ],
    createdAt: "2023-05-29T13:26:51.734Z",
    updatedAt: "2023-05-29T14:47:45.957Z",
    crowdinArticleDirectory: {
      id: "6474baaf73b854f4d464e38f",
      updatedAt: "2023-05-29T14:46:07.000Z",
      createdAt: "2023-05-29T14:46:07.000Z",
      name: "6474a81bef389b66642035ff",
      crowdinCollectionDirectory: {
        id: "6474baaf73b854f4d464e38d",
        updatedAt: "2023-05-29T14:46:07.000Z",
        createdAt: "2023-05-29T14:46:07.000Z",
        name: "promos",
        title: "Promos",
        collectionSlug: "promos",
        originalId: 1633,
        projectId: 323731,
        directoryId: 1169,
      },
      originalId: 1635,
      projectId: 323731,
      directoryId: 1633,
    },
  };
  const linkField: Field = {
    name: "link",
    type: "group",
    fields: [
      {
        name: "text",
        type: "text",
        localized: true,
      },
      {
        name: "href",
        type: "text",
      },
      {
        name: "type",
        type: "select",
        options: ["ctaPrimary", "ctaSecondary"],
      },
    ],
  };
  const Promos: CollectionConfig = {
    slug: "promos",
    admin: {
      defaultColumns: ["title", "updatedAt"],
      useAsTitle: "title",
      group: "Shared",
    },
    access: {
      read: () => true,
    },
    fields: [
      {
        name: "title",
        type: "text",
        localized: true,
      },
      {
        name: "text",
        type: "text",
        localized: true,
      },
      {
        name: "ctas",
        type: "array",
        minRows: 1,
        maxRows: 2,
        fields: [linkField],
      },
    ],
  };

  const expected: any = {
    ctas: {
      "6474a80221baea4f5f169757": {
        link: {
          text: "Talk to us",
        },
      },
      "6474a81021baea4f5f169758": {
        link: {
          text: "Try for free",
        },
      },
    },

    text: "Get in touch with us or try it out yourself",
    title: "Experience the magic of our product!",
  };

  it("includes group json fields nested inside of array field items", () => {
    expect(
      buildCrowdinJsonObject({
        doc,
        fields: getLocalizedFields({ fields: Promos.fields, type: "json" }),
      })
    ).toEqual(expected);
  });

  it("includes group json fields nested inside of array field items even when getLocalizedFields is run twice", () => {
    expect(
      buildCrowdinJsonObject({
        doc,
        fields: getLocalizedFields({
          fields: getLocalizedFields({ fields: Promos.fields }),
          type: "json",
        }),
      })
    ).toEqual(expected);
  });

  /**
   * afterChange builds a JSON object for the previous version of
   * a document to compare with the current version. Ensure this
   * function works in that scenario. Also important for dealing
   * with non-required empty fields.
   */
  it("can work with an empty document", () => {
    expect(
      buildCrowdinJsonObject({
        doc: {},
        fields: getLocalizedFields({ fields: Promos.fields }),
      })
    ).toEqual({});
  });

  it("can work with an empty array field", () => {
    expect(
      buildCrowdinJsonObject({
        doc: {
          ...doc,
          ctas: undefined,
        },
        fields: getLocalizedFields({ fields: Promos.fields }),
      })
    ).toEqual({
      text: "Get in touch with us or try it out yourself",
      title: "Experience the magic of our product!",
    });
  });

  it("can work with an empty group field in an array", () => {
    expect(
      buildCrowdinJsonObject({
        doc: {
          ...doc,
          ctas: [{}, {}],
        },
        fields: getLocalizedFields({ fields: Promos.fields }),
      })
    ).toEqual({
      text: "Get in touch with us or try it out yourself",
      title: "Experience the magic of our product!",
    });
  });
});
