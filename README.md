# LAN-air-hockey
i think i used to have a good readme, but apparently its not long enough. AI TIME

# 🪩 Air Hockey Multiplayer

A high-performance, real-time multiplayer air hockey game built for quick, competitive match-ups. Originally designed strictly for local network environments, the entire architecture has been overhauled to support global online matchmaking and direct peer-to-peer/server-relayed play—**no LAN required!** Whether you want to test your reflexes against a stranger across the world or challenge a friend in another city, the game delivers an authentic, responsive arcade experience right in your browser.

Partially AI-assisted for rapid prototyping, but heavily engineered, debugged, and optimized with precision logic, custom physics mathematics, and plenty of late-night coding sessions. 

---

> 🎯 **The Ultimate Goal:** I am developing this project to stack up enough Macondo Arcade coins to finally score a **MacBook Air**! Every feature shipped, bug squashed, and match played brings me one step closer to upgrading my development rig. 

---

## 🚀 Key Features

* 🌍 **True Zero-LAN Freedom:** Play with anyone, anywhere across the web. The game bypasses complex network configurations, tedious port forwarding, or local Wi-Fi sharing. Just share a link and jump straight into the action.
* ⚡ **Low-Latency Synced Physics:** Built to tackle the ultimate enemy of online gaming: *lag*. Utilizing optimized server-client reconciliation, client-side prediction, and interpolation algorithms, puck trajectories and high-speed paddle impacts stay perfectly synced across both screens.
* 🎮 **Smooth Canvas Rendering:** Written entirely in vanilla JavaScript using the HTML5 Canvas API. By avoiding hefty game engine overhead, the game boasts an incredibly lightweight footprint, lightning-fast initial load times, and buttery-smooth, high-frame-rate visual execution (60+ FPS) even on lower-end devices.
* 👥 **Dynamic Room Creation & Matchmaking:** Features a streamlined lobby system. Players can instantly join a public queue or spin up a private room with a unique room code to invite specific opponents.
* 📊 **Real-time Score & State Management:** A centralized server authoritative state machine tracks scores, handles match resets, manages sudden-death overtimes, and detects player disconnections gracefully.

---

## 🛠️ Built With

The project embraces a lean, powerful, and dependency-light stack to maximize performance and maintain total control over the game loop:

* **Frontend:** * **Semantic HTML5 & CSS3:** For a clean, responsive interface, interactive lobbies, and an immersive arcade aesthetic.
  * **Vanilla JavaScript (Canvas API):** Drives the rendering pipeline, handles local user input, and executes the vector mathematics for real-time physics simulation.
* **Backend & Networking:** * **Node.js & Express:** Powers the core game server, handles static file routing, and manages active room instances.
  * **Socket.io:** The backbone of our real-time networking, enabling ultra-low-latency, bi-directional event communication between the server and clients via WebSockets.

---

## 🐛 Known Issues & Roadmap

While the game is fully playable, maintaining a physics engine from scratch comes with its fair share of edge cases. Here is what is currently on the workbench:

### 🚨 Current Focus: The Paddle Collision Throttle Bug
* **The Problem:** When a player traps or hits the puck forcefully into a corner or directly against the wall, the physics engine panics. The rapid, consecutive collision calculations cause the puck to jitter violently, glitch through the boundaries, or occasionally phase completely out of the map.
* **The Fix:** Currently implementing a collision throttling algorithm alongside discrete delta-time positioning checks to safely reject overlapping bounding boxes and stabilize vector reflections.

### 🗺️ Future Roadmap
* [ ] **Power-ups & Mutators:** Introduce chaos modes featuring shrinking paddles, multi-puck madness, and shifting friction zones.
* [ ] **Persistent Leaderboards:** Integrate database support to track player wins, ratios, and fastest-scoring shots.
* [ ] **Audio Design:** Add satisfying, high-fidelity sound effects for puck-to-wall bounces, paddle smashes, and crowd cheers on goals.

---

## 💖 Special Thanks

A massive shoutout to the **Hack Club** community for providing the tools, the ecosystem, the endless supply of inspiration, and the motivation to ship awesome projects. 

✨ Explore the arcade, build incredible things, and earn real-world rewards at [Macondo by Hack Club](https://macondo.hackclub.com)!
