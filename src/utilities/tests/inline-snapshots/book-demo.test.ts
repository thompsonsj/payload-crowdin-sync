import BookDemo from "./collections/BookDemo";
import {
  buildCrowdinJsonObject,
  buildCrowdinHtmlObject,
  buildPayloadUpdateObject,
  getLocalizedFields,
} from "../..";

describe("book demo collection snapshots", () => {
  const doc = {
    hero: {
      title: [
        {
          type: "p",
          children: [
            {
              text: "Réservez une démo",
            },
          ],
        },
      ],
      text: [
        {
          type: "p",
          children: [
            {
              text: "Apprenez comment Acme Corp peut vous aider à ",
            },
            {
              text: "atteindre vos objectifs",
              bold: true,
            },
            {
              text: ". Nous sommes prêts à parier que vous apprendrez quelque chose de nouveau lors de notre rencontre. Et si ce n’est pas le cas, on vous offre un cupcake ! 😉",
            },
          ],
        },
      ],
    },
    form: {
      title: "Réservez une démo",
      subTitle:
        "Nous vous contacterons dès que possible pour fixer une heure qui vous convienne.",
      content: {
        title: "",
        items: [
          {
            text: "",
            id: "64a8af5656f68b0022bfd267",
          },
          {
            text: "Offres d'emploi et utilisateurs illimités",
            id: "64a8af5656f68b0022bfd268",
          },
          {
            text: "",
            id: "64a8af5656f68b0022bfd269",
          },
          {
            text: "",
            id: "64a8af5656f68b0022bfd26a",
          },
          {
            text: "",
            id: "64a8af5656f68b0022bfd26b",
          },
          {
            text: "Des présentations produits et des webinaires gratuits",
            id: "64a8af5656f68b0022bfd26c",
          },
          {
            text: "Un accès complet à l'Académie Acme Corp",
            id: "64a8af5656f68b0022bfd26d",
          },
        ],
      },
    },
    logoTitle: "Adoré par les meilleurs recruteurs internationaux",
    promo: "6474f51370b180880beb4bcb",
    meta: {
      title: "Réservez une démo | Acme Corp",
      description:
        "Book a demo of Acme Corp Widget and let our team show you the magic of our product! Schedule a call with one of team members here.",
    },
    crowdinArticleDirectory: "6486e2a7715834a0e4b7cea4",
    _status: "published",
    globalType: "book-demo",
    createdAt: "2023-06-12T07:43:55.361Z",
    updatedAt: "2023-07-25T09:43:57.619Z",
    id: "6486ccbb27a4f59700b066ec",
  };
  const fields = BookDemo.fields;
  const localizedFields = getLocalizedFields({ fields });
  const crowdinJsonObject = buildCrowdinJsonObject({
    doc,
    fields: localizedFields,
  });
  const crowdinHtmlObject = buildCrowdinHtmlObject({
    doc,
    fields: localizedFields,
  });

  it("getLocalizedFields", () => {
    expect(getLocalizedFields({ fields })).toMatchInlineSnapshot(`
      [
        {
          "localized": true,
          "name": "logoTitle",
          "required": true,
          "type": "text",
        },
        {
          "fields": [
            {
              "admin": {
                "elements": [],
                "leaves": [
                  "bold",
                ],
              },
              "name": "title",
              "type": "richText",
            },
            {
              "admin": {
                "elements": [],
                "leaves": [
                  "bold",
                ],
              },
              "name": "text",
              "type": "richText",
            },
          ],
          "localized": true,
          "name": "hero",
          "type": "group",
        },
        {
          "fields": [
            {
              "name": "title",
              "type": "text",
            },
            {
              "name": "subTitle",
              "type": "text",
            },
            {
              "fields": [
                {
                  "name": "title",
                  "type": "text",
                },
                {
                  "fields": [
                    {
                      "name": "text",
                      "type": "text",
                    },
                  ],
                  "localized": true,
                  "name": "items",
                  "type": "array",
                },
              ],
              "localized": true,
              "name": "content",
              "type": "group",
            },
          ],
          "localized": true,
          "name": "form",
          "type": "group",
        },
      ]
    `);
  });

  it("buildCrowdinJsonObject", () => {
    expect(crowdinJsonObject).toMatchInlineSnapshot(`
      {
        "form": {
          "content": {
            "items": {
              "64a8af5656f68b0022bfd268": {
                "text": "Offres d'emploi et utilisateurs illimités",
              },
              "64a8af5656f68b0022bfd26c": {
                "text": "Des présentations produits et des webinaires gratuits",
              },
              "64a8af5656f68b0022bfd26d": {
                "text": "Un accès complet à l'Académie Acme Corp",
              },
            },
          },
          "subTitle": "Nous vous contacterons dès que possible pour fixer une heure qui vous convienne.",
          "title": "Réservez une démo",
        },
        "logoTitle": "Adoré par les meilleurs recruteurs internationaux",
      }
    `);
  });

  it("buildCrowdinHtmlObject", () => {
    expect(crowdinHtmlObject).toMatchInlineSnapshot(`
      {
        "hero.text": [
          {
            "children": [
              {
                "text": "Apprenez comment Acme Corp peut vous aider à ",
              },
              {
                "bold": true,
                "text": "atteindre vos objectifs",
              },
              {
                "text": ". Nous sommes prêts à parier que vous apprendrez quelque chose de nouveau lors de notre rencontre. Et si ce n’est pas le cas, on vous offre un cupcake ! 😉",
              },
            ],
            "type": "p",
          },
        ],
        "hero.title": [
          {
            "children": [
              {
                "text": "Réservez une démo",
              },
            ],
            "type": "p",
          },
        ],
      }
    `);
  });

  it("buildPayloadUpdateObject", () => {
    const docTranslations = buildPayloadUpdateObject({
      crowdinJsonObject,
      crowdinHtmlObject,
      fields: localizedFields,
      document: doc,
    });
    expect(docTranslations).toMatchInlineSnapshot();
  });
});
