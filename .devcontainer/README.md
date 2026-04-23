# Dev Container Setup

This repository predates the modern `custom-cards/boilerplate-card` source layout.
It is still a single-file custom card, so this directory provides a repo-specific
VS Code + Home Assistant playground that mounts the repository directly into Home
Assistant instead of running a `src/` to `dist/` build pipeline.

This setup follows the same overall pattern as the official Home Assistant
devcontainer guidance, while adapting it to a standalone custom card repository:

- https://developers.home-assistant.io/docs/development_environment/
- https://developers.home-assistant.io/docs/setup_devcontainer_environment/

Those docs are the reference point for this setup. This repository still keeps a
compose-based Home Assistant sidecar because it is a standalone custom card
rather than a Home Assistant Python repository.

## What This Starts

- A repo-specific VS Code devcontainer built from the local `Dockerfile.dev`
- A Home Assistant instance forwarded through VS Code's Ports view
- A Lovelace dashboard that loads this repository from:
  - `/local/lovelace-collapsable-card/collapsable-card.js?v=dev`

## First Run

1. Install Docker Desktop with Docker Compose v2 support.
2. Start Docker Desktop.
3. Install the VS Code Dev Containers extension.
4. Open this repository in VS Code.
5. Run `Dev Containers: Reopen in Container`.
6. Wait for Home Assistant to finish booting.
7. Open the forwarded `Home Assistant` port from VS Code.
8. Complete onboarding to create the first owner account.
9. The dev config also keeps the `dev` / `dev` command-line auth provider available for later logins.

## Development Loop

1. Edit `collapsable-card.js` in the workspace.
2. Refresh the Home Assistant page.
3. If the browser keeps an old module cached, do a hard refresh.

Because this repo is mounted directly into `/config/www`, there is no copy step.
Your saved changes are what Home Assistant serves.

## Notes

- The test Home Assistant configuration lives in `ha-dev/`.
- Generated Home Assistant state files under `ha-dev/` are ignored by Git.
- The workspace container follows the Home Assistant `Dockerfile.dev` style, but
  this repository does not use Home Assistant Core's `script/setup` or VS Code
  task workflow.
- If `Dev Containers: Reopen in Container` fails before startup, check that
  `docker compose` works on your machine. This setup uses a multi-container
  devcontainer so the workspace and Home Assistant instance can run together.
- Home Assistant shares the workspace container's network namespace, so Docker
  does not need to reserve host port `8123`. VS Code forwards the service port
  automatically and may choose a different local port if `8123` is already in use.
- If you later migrate this repository to the full boilerplate-card structure,
  you can keep the same overall devcontainer approach and replace the direct file
  mount with the usual `yarn start` / `dist/` workflow.