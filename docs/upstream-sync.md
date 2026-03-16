# Upstream Sync

This fork is the source of truth for UI changes, including Lovable edits.

## Behavior

On every push to `main` in `caseyjkey/Neon-Goals-UI`, GitHub Actions force-pushes the same commit to `keycasey/Neon-Goals-UI` `main`.

The upstream repository keeps the deployment workflow, so syncing to upstream triggers production deployment there.

## Required Secret

Configure this repository secret in the fork:

- `UPSTREAM_SYNC_TOKEN`

The token must have write access to `keycasey/Neon-Goals-UI`.

## Workflow

The sync automation lives in:

- `.github/workflows/sync-upstream.yml`
