import type { Field } from "payload";
import { buildCrowdinJsonObject, getLocalizedFields } from "../..";
import {
  basicNonLocalizedFields,
  basicLocalizedFields,
  emptyFieldDocValue,
  fieldJsonCrowdinObject,
  fieldDocValue,
} from "../fixtures/basic-localized-fields.fixture";

describe("fn: buildCrowdinJsonObject: group field type", () => {
  it("creates an empty JSON object if fields are empty", () => {
    const doc = {
      id: "638641358b1a140462752076",
      title: "",
      groupField: emptyFieldDocValue,
      status: "draft",
      createdAt: "2022-11-29T17:28:21.644Z",
      updatedAt: "2022-11-29T17:28:21.644Z",
    };
    const fields: Field[] = [
      {
        name: "title",
        type: "text",
        localized: true,
      },
      {
        name: "groupField",
        type: "group",
        fields: basicLocalizedFields,
      },
    ];
    const localizedFields = getLocalizedFields({ fields });
    const expected = {};
    expect(buildCrowdinJsonObject({ doc, fields: localizedFields })).toEqual(
      expected
    );
  });

  it("includes localized fields nested in a group", () => {
    const doc = {
      id: "638641358b1a140462752076",
      title: "Test Policy created with title",
      groupField: fieldDocValue,
      status: "draft",
      createdAt: "2022-11-29T17:28:21.644Z",
      updatedAt: "2022-11-29T17:28:21.644Z",
    };
    const fields: Field[] = [
      {
        name: "title",
        type: "text",
        localized: true,
      },
      {
        name: "groupField",
        type: "group",
        fields: basicLocalizedFields,
      },
    ];
    const localizedFields = getLocalizedFields({ fields });
    const expected = {
      title: "Test Policy created with title",
      groupField: fieldJsonCrowdinObject(),
    };
    expect(buildCrowdinJsonObject({ doc, fields: localizedFields })).toEqual(
      expected
    );
  });

  it("includes localized fields nested in a group with a localization setting on the group field", () => {
    const doc = {
      id: "638641358b1a140462752076",
      title: "Test Policy created with title",
      groupField: fieldDocValue,
      status: "draft",
      createdAt: "2022-11-29T17:28:21.644Z",
      updatedAt: "2022-11-29T17:28:21.644Z",
    };
    const fields: Field[] = [
      {
        name: "title",
        type: "text",
        localized: true,
      },
      {
        name: "groupField",
        type: "group",
        localized: true,
        fields: basicNonLocalizedFields,
      },
    ];
    const localizedFields = getLocalizedFields({ fields });
    const expected = {
      title: "Test Policy created with title",
      groupField: fieldJsonCrowdinObject(),
    };
    expect(buildCrowdinJsonObject({ doc, fields: localizedFields })).toEqual(
      expected
    );
  });

  it("includes localized fields and meta @payloadcms/plugin-seo ", () => {
    const doc = {
      id: "638641358b1a140462752076",
      title: "Test Policy created with title",
      status: "draft",
      meta: {
        title: "Meta title value",
        description: "Meta description value.\nCan contain new lines.",
      },
      createdAt: "2022-11-29T17:28:21.644Z",
      updatedAt: "2022-11-29T17:28:21.644Z",
    };
    const localizedFields: Field[] = [
      {
        name: "title",
        type: "text",
        localized: true,
      },
      {
        name: "meta",
        label: "SEO",
        type: "group",
        fields: [
          {
            name: "title",
            type: "text",
            localized: true,
            admin: {
              components: {},
            },
          },
          {
            name: "description",
            type: "textarea",
            localized: true,
            admin: {
              components: {},
            },
          },
        ],
      },
    ];
    const expected = {
      title: "Test Policy created with title",
      meta: {
        title: "Meta title value",
        description: "Meta description value.\nCan contain new lines.",
      },
    };
    expect(buildCrowdinJsonObject({ doc, fields: localizedFields })).toEqual(
      expected
    );
  });

  it("includes localized fields nested in groups nested in a group", () => {
    const doc = {
      id: "638641358b1a140462752076",
      title: "Test Policy created with title",
      groupField: {
        nestedGroupField: fieldDocValue,
        secondNestedGroupField: fieldDocValue,
      },
      status: "draft",
      createdAt: "2022-11-29T17:28:21.644Z",
      updatedAt: "2022-11-29T17:28:21.644Z",
    };
    const fields: Field[] = [
      {
        name: "title",
        type: "text",
        localized: true,
      },
      {
        name: "groupField",
        type: "group",
        fields: [
          {
            name: "nestedGroupField",
            type: "group",
            fields: basicLocalizedFields,
          },
          {
            name: "secondNestedGroupField",
            type: "group",
            fields: basicLocalizedFields,
          },
        ],
      },
    ];
    const localizedFields = getLocalizedFields({ fields });
    const expected = {
      title: "Test Policy created with title",
      groupField: {
        nestedGroupField: fieldJsonCrowdinObject(),
        secondNestedGroupField: fieldJsonCrowdinObject(),
      },
    };
    expect(buildCrowdinJsonObject({ doc, fields: localizedFields })).toEqual(
      expected
    );
  });

  it("includes localized fields nested in groups nested in a group nested in a collapsible field", () => {
    const doc = {
      id: "638641358b1a140462752076",
      title: "Test Policy created with title",
      groupField: {
        nestedGroupField: fieldDocValue,
        secondNestedGroupField: fieldDocValue,
      },
      status: "draft",
      createdAt: "2022-11-29T17:28:21.644Z",
      updatedAt: "2022-11-29T17:28:21.644Z",
    };
    const fields: Field[] = [
      {
        name: "title",
        type: "text",
        localized: true,
      },
      {
        label: "collapsibleField",
        type: "collapsible",
        fields: [
          {
            name: "groupField",
            type: "group",
            fields: [
              {
                name: "nestedGroupField",
                type: "group",
                fields: basicLocalizedFields,
              },
              {
                name: "secondNestedGroupField",
                type: "group",
                fields: basicLocalizedFields,
              },
            ],
          },
        ],
      },
    ];
    const localizedFields = getLocalizedFields({ fields });
    const expected = {
      title: "Test Policy created with title",
      groupField: {
        nestedGroupField: fieldJsonCrowdinObject(),
        secondNestedGroupField: fieldJsonCrowdinObject(),
      },
    };
    expect(buildCrowdinJsonObject({ doc, fields: localizedFields })).toEqual(
      expected
    );
  });

  it("includes localized fields nested in groups nested in a group nested in a collapsible field with top-level localization settings", () => {
    const doc = {
      id: "638641358b1a140462752076",
      title: "Test Policy created with title",
      groupField: {
        nestedGroupField: fieldDocValue,
        secondNestedGroupField: fieldDocValue,
      },
      status: "draft",
      createdAt: "2022-11-29T17:28:21.644Z",
      updatedAt: "2022-11-29T17:28:21.644Z",
    };
    const fields: Field[] = [
      {
        name: "title",
        type: "text",
        localized: true,
      },
      {
        label: "collapsibleField",
        type: "collapsible",
        fields: [
          {
            name: "groupField",
            type: "group",
            fields: [
              {
                name: "nestedGroupField",
                type: "group",
                localized: true,
                fields: basicNonLocalizedFields,
              },
              {
                name: "secondNestedGroupField",
                type: "group",
                localized: true,
                fields: basicNonLocalizedFields,
              },
            ],
          },
        ],
      },
    ];
    const localizedFields = getLocalizedFields({ fields });
    const expected = {
      title: "Test Policy created with title",
      groupField: {
        nestedGroupField: fieldJsonCrowdinObject(),
        secondNestedGroupField: fieldJsonCrowdinObject(),
      },
    };
    expect(buildCrowdinJsonObject({ doc, fields: localizedFields })).toEqual(
      expected
    );
  });
});
