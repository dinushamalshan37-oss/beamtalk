defmodule BeamTalkWeb.UserSocket do
  use Phoenix.Socket

  channel "room:*", BeamTalkWeb.RoomChannel

  @impl true
  def connect(%{"nickname" => nickname}, socket, _connect_info) do
    cleaned = nickname |> String.trim() |> String.slice(0, 24)

    if String.length(cleaned) >= 2 do
      {:ok, assign(socket, :nickname, cleaned)}
    else
      :error
    end
  end

  def connect(_, _socket, _connect_info), do: :error

  @impl true
  def id(_socket), do: nil
end
