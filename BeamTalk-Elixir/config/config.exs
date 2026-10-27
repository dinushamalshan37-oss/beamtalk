import Config

config :beamtalk, BeamTalkWeb.Endpoint,
  url: [host: "localhost"],
  http: [ip: {127, 0, 0, 1}, port: String.to_integer(System.get_env("PORT", "4000"))],
  server: true,
  # Local-development key ONLY. Production deployment must set a secret in runtime config.
  secret_key_base: "6c7139c14c07a2251b9277f0265b626a2d8f4ad96cd34e6289fb72117f1866aa",
  pubsub_server: BeamTalk.PubSub,
  check_origin: ["//localhost", "//127.0.0.1"]

config :phoenix, :json_library, Jason
