import Config

if config_env() == :prod do
  secret = System.fetch_env!("SECRET_KEY_BASE")
  port = String.to_integer(System.get_env("PORT", "4000"))
  host = System.get_env("PHX_HOST", "localhost")

  config :beamtalk, BeamTalkWeb.Endpoint,
    secret_key_base: secret,
    url: [host: host, port: 443, scheme: "https"],
    http: [ip: {0, 0, 0, 0}, port: port],
    check_origin: ["//#{host}"]
end
