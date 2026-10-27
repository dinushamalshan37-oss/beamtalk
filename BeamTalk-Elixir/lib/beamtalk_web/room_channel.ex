defmodule BeamTalkWeb.RoomChannel do
  use Phoenix.Channel
  alias BeamTalk.ChatStore
  alias BeamTalkWeb.Presence

  @impl true
  def join("room:" <> room, _payload, socket) do
    if valid_room?(room) do
      socket = assign(socket, :room, room)
      send(self(), :after_join)
      {:ok, %{messages: ChatStore.list(room)}, socket}
    else
      {:error, %{reason: "Room names must be 2–30 letters, numbers, _ or -"}}
    end
  end

  @impl true
  def handle_info(:after_join, socket) do
    # Unique per-connection tracker ref: multiple people may share a nickname.
    Presence.track(socket, socket.assigns.nickname, %{joined_at: System.system_time(:second)})
    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  @impl true
  def handle_in("new_message", %{"body" => original}, socket) when is_binary(original) do
    body = String.trim(original)

    cond do
      body == "" -> {:reply, {:error, %{reason: "Message cannot be blank"}}, socket}
      String.length(body) > 500 -> {:reply, {:error, %{reason: "Maximum 500 characters"}}, socket}
      true ->
        case ChatStore.post(socket.assigns.room, socket.assigns.nickname, body) do
          {:ok, message} ->
            broadcast!(socket, "new_message", message)
            {:reply, {:ok, %{id: message.id}}, socket}

          {:error, :room_limit} ->
            {:reply, {:error, %{reason: "Server room limit reached"}}, socket}
        end
    end
  end

  def handle_in("new_message", _bad_payload, socket),
    do: {:reply, {:error, %{reason: "Expected text message"}}, socket}

  defp valid_room?(room), do: Regex.match?(~r/^[a-zA-Z0-9_-]{2,30}$/, room)
end
