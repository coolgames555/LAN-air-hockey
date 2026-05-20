# LAN-air-hockey
i think i used to have a good readme, but apparently its not long enough. AI TIME

# 🪩 Air Hockey Multiplayer

A high-performance, real-time multiplayer air hockey game built for quick, competitive match-ups. Originally designed strictly for local network environments, the architecture has been upgraded to support global online matchmaking and direct play—**no LAN required!**

Partially vibe-coded, but mostly engineered with precision, logic, and late-night sessions. 

> 🎯 **The Ultimate Goal:** Developing this project to stack up enough Macondo coins to finally score a **Hasselblad X2D**! 📸

---

## 🚀 Key Features

* 🌍 **Zero-LAN Requirement:** Play with anyone, anywhere across the web. No complex network configuration, port forwarding, or local Wi-Fi sharing required.
* ⚡ **Low-Latency Synced Physics:** Optimized server-client reconciliation to ensure that puck trajectories and paddle impacts stay perfectly synced across both screens.
* 🎮 **Smooth Canvas Rendering:** Built using the HTML5 Canvas API for lightweight, high-frame-rate visual execution without hefty engine overhead.

---

## 🛠️ Built With

* **Frontend:** Semantic HTML5, CSS3, and Vanilla JavaScript (Canvas API)
* **Backend/Networking:** Node.js with Socket.io for real-time, bi-directional event communication

---

## 🐛 Known Issues & Roadmap

### 🚨 Current Focus: The Paddle Collision Throttle Bug
* **The Problem:** The current collision detection loop introduces an artificial bottleneck, limiting the number of consecutive paddle-to-puck impacts allowed within a tight time window. 
* **The Fix:** A refactor of the physics update loop is underway to separate local collision detection completely from the network tick rate. This will allow for fluid, unlimited continuous hits. *Fix arriving in the next push!*

---

## 💖 Special Thanks

A massive shoutout to the **Hack Club** community for providing the tools, the ecosystem, and the motivation to ship awesome projects.

✨ Explore the arcade, build things, and earn rewards at [Macondo by Hack Club](https://macondo.hackclub.com)!
