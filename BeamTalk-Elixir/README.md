# ✦ BeamTalk — Real-time Elixir Chat

> A minimalist multi-room chat demo built with Elixir, Phoenix Channels and Phoenix Presence.

**Repository:** `beamtalk`  
**GitHub description:** Real-time group chat built with Elixir, Phoenix Channels and Presence, featuring rooms, message history and online members.

## Implemented features

- Real-time WebSocket chat using the Phoenix channel wire protocol
- Create/join rooms, nickname login (not authenticated), online-member list
- Last 100 messages per room stored **in memory**; messages disappear after server restarts
- Input validation, text-only messages and DOM-safe output rendering
- Mobile-friendly dark UI served by the Elixir server, with no frontend build step
- Health endpoint: `GET /health`
- Basic unit tests for the message store

## Requirements

- Elixir 1.18+ and compatible Erlang/OTP
- Internet access the first time Mix downloads Phoenix dependencies

## Start locally

```bash
cd BeamTalk-Elixir
mix local.hex --force
mix deps.get
mix phx.server
```

Open **http://localhost:4000** in two tabs. Enter different nicknames to try live chat.

```bash
mix test
```

If `mix phx.server` is unavailable in your installation, use `mix run --no-halt` to start the supervised endpoint.

## Architecture

```text
Browser (vanilla JS WebSocket)
           |
Phoenix Endpoint + RoomChannel
       /             \
Phoenix Presence   ChatStore GenServer
    (online)          (RAM history)
```

## Current MVP limitations

- **Not production-ready**: nickname is not proof of identity, there is no auth/rate limiting, and storage is not durable.
- This version **does not use PostgreSQL**. Future upgrade: Ecto + PostgreSQL migration for persistent messages, Phoenix authentication, per-room access control, moderation and rate limiting.
- Intended to run locally (`127.0.0.1`) by default. In production set `SECRET_KEY_BASE`, `PHX_HOST`, reverse-proxy TLS, and deploy with appropriate security reviews.
- User-created room shortcuts exist only in the current browser tab; message history is shared on the server.

## Suggested GitHub topics

`elixir` `phoenix` `websocket` `realtime-chat` `presence` `backend` `portfolio`

## License

MIT — see [LICENSE](LICENSE) in this folder.
