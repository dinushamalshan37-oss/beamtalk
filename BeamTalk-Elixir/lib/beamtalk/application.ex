defmodule BeamTalk.Application do
  @moduledoc "Application supervisor for the chat server."
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      BeamTalk.ChatStore,
      {Phoenix.PubSub, name: BeamTalk.PubSub},
      BeamTalkWeb.Presence,
      BeamTalkWeb.Endpoint
    ]

    Supervisor.start_link(children, strategy: :one_for_one, name: BeamTalk.Supervisor)
  end

  @impl true
  def config_change(changed, _new, removed) do
    BeamTalkWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
