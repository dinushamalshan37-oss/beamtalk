defmodule BeamTalk.ChatStoreTest do
  use ExUnit.Case, async: true
  alias BeamTalk.ChatStore

  test "posts and returns messages in insertion order" do
    room = "test-#{System.unique_integer([:positive])}"
    assert ChatStore.list(room) == []
    assert {:ok, first} = ChatStore.post(room, "Sam", "Hello")
    assert {:ok, second} = ChatStore.post(room, "Jo", "Hi")
    assert first.id != second.id
    assert Enum.map(ChatStore.list(room), & &1.body) == ["Hello", "Hi"]
  end

  test "keeps only the most recent 100 messages" do
    room = "room-#{System.unique_integer([:positive])}"
    for n <- 1..105, do: ChatStore.post(room, "User", Integer.to_string(n))
    messages = ChatStore.list(room)
    assert length(messages) == 100
    assert hd(messages).body == "6"
  end
end
