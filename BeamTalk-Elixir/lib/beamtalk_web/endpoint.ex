defmodule BeamTalkWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :beamtalk

  socket "/socket", BeamTalkWeb.UserSocket,
    websocket: true,
    longpoll: false

  plug Plug.Static,
    at: "/",
    from: :beamtalk,
    only: ~w(assets)

  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]
  plug Plug.Parsers, parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"], json_decoder: Jason
  plug BeamTalkWeb.Router
end
