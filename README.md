# 💼 Flexy — Real-Time Service Marketplace Platform

**Flexy** is a full-stack, real-time service marketplace that connects customers with skilled local workers for everyday tasks such as plumbing, electrical work, cleaning, and repairs.
The platform focuses on **secure communication**, **role-based access**, and **real-time interactions**, simulating a production-style system rather than a demo application.

---

## 🧠 Problem Statement

Finding reliable local workers is often time-consuming and inefficient.
Customers struggle with delayed responses, while workers lack a unified platform to manage availability, bookings, and communication.

**Flexy solves this by providing:**

* Clear separation of user roles
* Real-time communication
* Structured job discovery and booking
* Scalable backend architecture

---

## ✨ Key Features

### 👥 Role-Based System

* **Customers** can post job requirements and communicate with workers
* **Workers** can list services, manage availability, and respond to requests
* Authorization enforced across APIs and real-time connections

### 💬 Real-Time Chat

* Secure, JWT-authenticated Socket.IO communication
* One-to-one chat between customers and workers
* Message persistence with conversation history

### 📅 Booking & Scheduling

* Customers can schedule jobs in advance
* Workers manage job acceptance and availability

### 🟢 Availability Management

* Workers can update real-time availability status
* Enables faster discovery and reduced response time

---

## 🏗️ System Architecture (High Level)

* REST APIs handle authentication, job management, and data persistence
* WebSockets manage real-time messaging and live interactions
* MongoDB stores users, roles, conversations, and messages
* Frontend communicates via REST + sockets for consistent state sync

---

## 🧰 Tech Stack

### Frontend

* React.js

### Backend

* Node.js
* Express.js

### Database

* MongoDB with Mongoose

### Authentication & Security

* JWT-based authentication
* Role-based authorization

### Real-Time

* Socket.IO (WebSockets)

### Tooling & Deployment

* Git & GitHub
* Postman
* Netlify / Render

---

## 📁 Project Structure

```
Flexy/
├── frontend/
│   ├── components/
│   ├── pages/
│
├── backend/
│   ├── routes/
│   ├── models/
│   └── sockets/
│
├── README.md
└── package.json
```

---

## 🧩 Engineering Highlights

* Designed RESTful APIs with proper status codes and error handling
* Implemented JWT authentication for both HTTP and WebSocket connections
* Structured MongoDB schemas for scalability and future extensions
* Handled real-time message flow with persistence and reconnection safety
* Deployed full-stack application with environment-based configuration

---

## 🚧 Current Status

**Actively improving toward production readiness**

Planned improvements:

* Message pagination and throttling
* Centralized logging and monitoring
* Improved authorization rules
* Scalability considerations for high user load

---

## 🎯 Why This Project Matters

* Demonstrates **full-stack ownership**
* Shows understanding of **real-time systems**
* Focuses on **engineering fundamentals**, not just UI
* Designed to be extensible and production-oriented

This project represents a transition from *student-level apps* to *junior-engineer systems*.

---

## 🔗 Links

* 🌐 Live Demo: [https://flexy-life.netlify.app/](https://flexy-life.netlify.app/)
* 💻 Backend Repo: [https://github.com/kalviumcommunity/S75_SLakshmi_Shankar_Flexy](https://github.com/kalviumcommunity/S75_SLakshmi_Shankar_Flexy)

---

## 👤 Author

**Shankar**
B.Tech CSE — Software Product Engineering

---