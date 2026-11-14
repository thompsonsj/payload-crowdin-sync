---
name: docs-voice
description: Write and edit payload-crowdin-sync documentation, READMEs, homepage copy, and llms.txt in the project's human voice. Use when changing docs-site, README, plugin README, or any user-facing prose.
---

# Docs voice

Docs should sound like someone who has shipped Payload and Crowdin, not a product page.

## Voice

- British spelling: organise, minimise, customise, behaviour.
- Lead with what translators get: nested Payload documents rebuilt as few HTML and JSON files. Non-translatable fields stay in Payload.
- Be specific. Name field types, `fields.json`, Lexical blocks, Crowdin folders.
- Mix short sentences with longer ones. Contractions are fine.
- How-to pages address the reader as "you". Use "we" only in repo or engineering notes.

## Do not

- Em dashes
- Openers like "The advantage is…", "It's not X, it's Y", "Let's dive in"
- hollow words: robust, seamless, leverage, comprehensive, streamline, game-changer
- "clean" as a synonym for good
- Bold stacks, emoji in headings, brochure intensifiers ("excellent", "battle-tested") unless the user wrote them

## When editing

Change the flagged spans. Leave paragraphs that already sound human. Do not rewrite code samples, option names, or Crowdin API details to sound friendlier.
