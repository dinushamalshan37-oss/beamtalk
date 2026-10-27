defmodule BeamTalk.ChatStore do
  @moduledoc """
  In-memory, bounded message history for a small development chat server.
  History is lost on restart; see README for production persistence steps.
  """
  use GenServer

  @max_messages 100
  @max_rooms 200

  def start_link(_opts), do: GenServer.start_link(__MODULE__, %{}, name: __MODULE__)

  def list(room) when is_binary(room), do: GenServer.call(__MODULE__, {:list, room})

  def post(room, author, body) when is_binary(room) and is_binary(author) and is_binary(body) do
    GenServer.call(__MODULE__, {:post, room, author, body})
  end

  @impl true
  def init(_initial), do: {:ok, %{}}

  @impl true
  def handle_call({:list, room}, _from, state) do
    {:reply, Map.get(state, room, []), state}
  end

  def handle_call({:post, room, author, body}, _from, state) do
    message = %{
      id: System.unique_integer([:positive, :monotonic]) |> Integer.to_string(),
      room: room,
      author: author,
      body: body,
      sent_at: DateTime.utc_now() |> DateTime.to_iso8601()
    }

    if not Map.has_key?(state, room) and map_size(state) >= @max_rooms do
      {:reply, {:error, :room_limit}, state}
    else
      messages = (Map.get(state, room, []) ++ [message]) |> Enum.take(-@max_messages)
      {:reply, {:ok, message}, Map.put(state, room, messages)}
    end
  end
end
