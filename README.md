💬 BeamTalk
Real-time team chat built with Elixir, Phoenix, and PostgreSQL.

BeamTalk is a project concept for a lightweight messaging platform where study groups and small teams can communicate in real time. The goal is to explore Elixir's concurrency model, Phoenix Channels, and resilient backend design.
Status: Planned project — features and setup below describe the intended implementation.

✨ Planned Features
- [ ] Create and join topic-based chat rooms
- [ ] Send and receive messages instantly with Phoenix Channels
- [ ] Show online members with Phoenix Presence
- [ ] Store message history in PostgreSQL
- [ ] Add user authentication and private rooms
- [ ] Show typing indicators and message timestamps
🛠️ Tech Stack
Layer	Technology
Language	Elixir
Web framework	Phoenix
Real-time communication	Phoenix Channels / Presence
Database	PostgreSQL + Ecto
Frontend	Phoenix LiveView or lightweight web UI


🧠 How It Will Work
1. A user joins a chat room through the web interface.
2. A Phoenix Channel broadcasts incoming messages to room members.
3. Phoenix Presence tracks active users.
4. Ecto saves messages to PostgreSQL for later retrieval.
🚀 Getting Started (After Implementation)
Prerequisites: Elixir, Erlang/OTP, PostgreSQL, and the Phoenix tooling required by the final project.
git clone https://github.com/YOUR_USERNAME/beamtalk.git
cd beamtalk
mix deps.get
mix ecto.setup
mix phx.server
Once the application is implemented and configured, open http://localhost:4000.
🗺️ Development Roadmap
Phase 1: Project scaffold, rooms, and basic messaging.
Phase 2: Persistence, online presence, and authentication.
Phase 3: Private conversations, moderation, and deployment.
🎯 Learning Goals
Elixir processes, message passing, fault tolerance, Phoenix Channels, database design, and real-time web architecture.
Built as a software engineering portfolio project.
