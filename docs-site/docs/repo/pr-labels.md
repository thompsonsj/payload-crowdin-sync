# PR labels

Automated labelling is configured across two files.

## Area labels (path-based)

Defined in `.github/labeler.yml` and applied by `actions/labeler@v5`. Labels are created automatically on first use.

| Label | Paths |
|-------|-------|
| `area: plugin` | `plugin/src/lib/**` |
| `area: test-installation` | `dev/**`, `dev-alternative-config/**` |
| `area: tests` | `**/*.spec.ts`, `**/*.test.ts` |
| `area: docs` | `docs-site/**`, `**/*.md` |
| `area: ci` | `.github/**` |
| `area: deps` | `**/package.json`, `**/package-lock.json` |

Labels stack — a plugin unit test change receives both `area: plugin` and `area: tests`.

## Type labels (PR title)

Applied by the `actions/github-script` step in `.github/workflows/pr-labels.yml` based on the Conventional Commits prefix in the PR title. Labels are created on first use.

| Label | Prefix |
|-------|--------|
| `type: feature` | `feat:` |
| `type: fix` | `fix:` |
| `type: docs` | `docs:` |
| `type: test` | `test:` |
| `type: refactor` | `refactor:` |
| `type: perf` | `perf:` |
| `type: deps` | `chore(deps):` |
| `type: chore` | `chore:` |
| `type: build` | `build:` |
| `type: ci` | `ci:` |

## Conventional Commits enforcement

`.github/workflows/pr-title.yml` uses `amannn/action-semantic-pull-request@v5` to fail CI if the PR title does not conform to the Conventional Commits spec. This matters because PRs are squash-merged, making the title the resulting commit message on `main`.

Allowed types: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `chore`, `build`, `ci`.

Scopes are optional. When provided they should match a known area (`plugin`, `test-installation`, `tests`, `docs`, `ci`, `deps`) or a code-level scope used in the commit history (`bydocument`, `translations`, `helpers`, `migrations`).
