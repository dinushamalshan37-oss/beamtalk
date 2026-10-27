defmodule BeamTalkWeb.Router do
  use Phoenix.Router

  get "/", BeamTalkWeb.PagePlug, []
  get "/health", BeamTalkWeb.HealthPlug, []
end

defmodule BeamTalkWeb.PagePlug do
  import Plug.Conn
  def init(opts), do: opts
  def call(conn, _opts) do
    html = Application.app_dir(:beamtalk, "priv/static/index.html") |> File.read!()
    conn |> put_resp_content_type("text/html; charset=utf-8") |> send_resp(200, html)
  end
end

defmodule BeamTalkWeb.HealthPlug do
  import Plug.Conn
  def init(opts), do: opts
  def call(conn, _opts), do: conn |> put_resp_content_type("application/json") |> send_resp(200, ~s({"ok":true}))
end
