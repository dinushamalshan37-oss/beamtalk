/* Minimal Phoenix Channel protocol v2 browser client: no CDN or bundler required. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const rooms = $("rooms");
  const dialog = $("name-dialog");
  const nameForm = $("name-form");
  const messages = $("messages");
  const composer = $("composer");
  const input = $("message-input");
  const userCount = $("user-count");
  const memberList = $("member-list");
  const status = $("status");
  const banner = $("banner");
  let nickname = sessionStorage.getItem("beamtalk-nickname") || "";
  let room = "general";
  let socket = null;
  let ref = 0;
  let joinRef = null;
  let isJoined = false;
  let retryTimer = null;
  let heartbeatTimer = null;
  let intentionalClose = false;
  const pending = new Map();

  function setStatus(connected, note = "") {
    status.textContent = connected ? "Connected" : "Disconnected";
    document.querySelectorAll(".status-dot").forEach((dot) => dot.classList.toggle("online", connected));
    banner.textContent = note;
    input.disabled = !connected || !isJoined;
    $("send").disabled = input.disabled;
  }

  function packet(topic, event, payload = {}, ownRef = null, jref = joinRef) {
    const messageRef = ownRef ?? String(++ref);
    socket.send(JSON.stringify([jref, messageRef, topic, event, payload]));
    return messageRef;
  }

  function clearMessages() {
    messages.replaceChildren();
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Conversation starts here. Say hello 👋";
    messages.append(empty);
  }

  function appendMessage(msg) {
    const empty = messages.querySelector(".empty");
    if (empty) empty.remove();
    const item = document.createElement("article");
    item.className = "message";
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = (msg.author || "?").slice(0, 1).toUpperCase();
    const body = document.createElement("div");
    body.className = "message-body";
    const meta = document.createElement("div");
    meta.className = "message-meta";
    const author = document.createElement("span");
    author.className = "author";
    author.textContent = msg.author || "Unknown";
    const time = document.createElement("time");
    time.className = "time";
    const date = new Date(msg.sent_at);
    time.textContent = Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const text = document.createElement("div");
    text.className = "content";
    text.textContent = msg.body || ""; // Never render user text via innerHTML.
    meta.append(author, time);
    body.append(meta, text);
    item.append(avatar, body);
    messages.append(item);
    messages.scrollTop = messages.scrollHeight;
  }

  function renderPresence(online) {
    const names = Object.keys(online || {}).sort((a, b) => a.localeCompare(b));
    memberList.replaceChildren();
    for (const name of names) {
      const item = document.createElement("div");
      item.className = "member";
      const dot = document.createElement("span");
      dot.className = "status-dot";
      const span = document.createElement("span");
      span.textContent = name;
      item.append(dot, span);
      memberList.append(item);
    }
    userCount.textContent = String(names.length);
  }

  function refreshRoomButton() {
    for (const btn of rooms.querySelectorAll(".room")) btn.classList.toggle("active", btn.dataset.room === room);
    $("room-title").textContent = `# ${room}`;
    input.placeholder = `Message #${room}`;
    clearMessages();
    renderPresence({});
  }

  function joinRoom() {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    isJoined = false;
    setStatus(true, `Joining #${room}...`);
    joinRef = packet(`room:${room}`, "phx_join", {}, null, null);
    pending.set(joinRef, "join");
  }

  function handlePacket(raw) {
    let frame;
    try { frame = JSON.parse(raw); } catch { return; }
    if (!Array.isArray(frame) || frame.length !== 5) return;
    const [jref, messageRef, topic, event, payload] = frame;
    if (topic === "phoenix" && event === "phx_reply") return; // heartbeat ack
    if (topic !== `room:${room}` || jref && jref !== joinRef) return;
    if (event === "phx_reply" && messageRef === joinRef) {
      pending.delete(messageRef);
      if (payload.status === "ok") {
        isJoined = true;
        setStatus(true, "");
        for (const msg of payload.response?.messages || []) appendMessage(msg);
        input.focus();
      } else {
        setStatus(true, payload.response?.reason || "Unable to join room");
      }
    } else if (event === "new_message") {
      appendMessage(payload);
    } else if (event === "presence_state") {
      window.__presence = payload;
      renderPresence(window.__presence);
    } else if (event === "presence_diff") {
      const presence = window.__presence || {};
      for (const [name, value] of Object.entries(payload.joins || {})) presence[name] = value;
      for (const [name, value] of Object.entries(payload.leaves || {})) {
        if (!presence[name]) continue;
        const leaving = new Set((value.metas || []).map((meta) => meta.phx_ref));
        const remaining = (presence[name].metas || []).filter((meta) => !leaving.has(meta.phx_ref));
        if (remaining.length) presence[name].metas = remaining;
        else delete presence[name];
      }
      renderPresence(presence);
    } else if (event === "phx_reply" && payload.status === "error") {
      banner.textContent = payload.response?.reason || "Message failed";
    }
  }

  function connect() {
    if (!nickname) return dialog.showModal();
    clearTimeout(retryTimer);
    clearInterval(heartbeatTimer);
    intentionalClose = false;
    isJoined = false;
    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    socket = new WebSocket(`${protocol}//${location.host}/socket/websocket?vsn=2.0.0&nickname=${encodeURIComponent(nickname)}`);
    setStatus(false, "Connecting to BeamTalk...");
    socket.onopen = () => {
      heartbeatTimer = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) packet("phoenix", "heartbeat", {}, null, null);
      }, 25000);
      joinRoom();
    };
    socket.onmessage = (event) => handlePacket(event.data);
    socket.onclose = () => {
      clearInterval(heartbeatTimer);
      isJoined = false;
      setStatus(false, "Connection lost. Reconnecting...");
      if (!intentionalClose) retryTimer = setTimeout(connect, 3000);
    };
    socket.onerror = () => { banner.textContent = "Cannot reach chat server."; };
  }

  function switchRoom(next) {
    if (next === room) return;
    if (isJoined && socket.readyState === WebSocket.OPEN) packet(`room:${room}`, "phx_leave", {}, null, joinRef);
    room = next;
    window.__presence = {};
    refreshRoomButton();
    joinRoom();
  }

  rooms.addEventListener("click", (event) => {
    const button = event.target.closest("[data-room]");
    if (button) switchRoom(button.dataset.room);
  });
  $("join-room").addEventListener("submit", (event) => {
    event.preventDefault();
    const value = $("room-name").value.trim();
    if (!/^[a-zA-Z0-9_-]{2,30}$/.test(value)) return;
    if (!Array.from(rooms.querySelectorAll(".room")).some((b) => b.dataset.room === value)) {
      const btn = document.createElement("button");
      btn.className = "room";
      btn.type = "button";
      btn.dataset.room = value;
      btn.textContent = `# ${value}`;
      rooms.append(btn);
    }
    $("room-name").value = "";
    switchRoom(value);
  });
  composer.addEventListener("submit", (event) => {
    event.preventDefault();
    const body = input.value.trim();
    if (!body || body.length > 500 || !isJoined) return;
    packet(`room:${room}`, "new_message", { body });
    input.value = "";
  });
  $("change-name").addEventListener("click", () => {
    $("nickname").value = nickname;
    dialog.showModal();
  });
  nameForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const newName = $("nickname").value.trim();
    if (newName.length < 2 || newName.length > 24) return;
    nickname = newName;
    sessionStorage.setItem("beamtalk-nickname", nickname);
    dialog.close();
    clearTimeout(retryTimer);
    intentionalClose = true;
    if (socket) socket.close();
    connect();
  });

  refreshRoomButton();
  if (nickname) connect(); else dialog.showModal();
})();
