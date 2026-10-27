defmodule BeamTalkWeb.Presence do
  use Phoenix.Presence,
    otp_app: :beamtalk,
    pubsub_server: BeamTalk.PubSub
end
