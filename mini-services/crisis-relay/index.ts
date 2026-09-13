import { createServer } from "http";
import { Server, Socket } from "socket.io";

// Crisis-relay mini-service for the supervisor console.
// Real production: this service would consume crisis events from the safety classifier
// pipeline (Kafka/SQS) and fan them out to connected supervisor consoles in real-time.
// This demo emits simulated events every ~25-45s so the supervisor console can show
// a live queue updating without manual refresh.

const PORT = 3030;
const httpServer = createServer();
const io = new Server(httpServer, {
  path: "/",
  cors: { origin: "*", methods: ["GET", "POST"] },
  pingTimeout: 60000,
  pingInterval: 25000,
});

interface CrisisEvent {
  id: string;
  ts: number;
  user: string;
  reason: string;
  language: string;
  channel: "text" | "voice";
  status: "pending" | "reviewing" | "outreached" | "closed";
  slaRemainingSec: number;
  disposition?: string;
}

// In-memory queue — single-process demo only. Production would use Redis/Postgres.
const queue: CrisisEvent[] = [
  {
    id: "ce-live-1",
    ts: Date.now() - 38000,
    user: "User-7F3A (de-identified)",
    reason: "Suicidal ideation — high confidence (0.97)",
    language: "English",
    channel: "text",
    status: "pending",
    slaRemainingSec: 262,
  },
  {
    id: "ce-live-2",
    ts: Date.now() - 120000,
    user: "User-9B21 (de-identified)",
    reason: "Self-harm language",
    language: "English",
    channel: "voice",
    status: "reviewing",
    slaRemainingSec: 180,
    disposition: "Outreach in progress — voice session kept open",
  },
];

const REASONS = [
  "Suicidal ideation — high confidence (0.96)",
  "Self-harm language",
  "Domestic violence disclosure",
  "Overdose risk language",
  "Acute suicide plan",
  "Severe distress — crying speech detected",
];

const LANGUAGES = ["English", "Spanish", "Arabic (Gulf)"];
const CHANNELS: Array<"text" | "voice"> = ["text", "voice"];

function generateId(): string {
  return `ce-live-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function makeNewEvent(): CrisisEvent {
  return {
    id: generateId(),
    ts: Date.now(),
    user: `User-${Math.random().toString(36).slice(2, 6).toUpperCase()} (de-identified)`,
    reason: REASONS[Math.floor(Math.random() * REASONS.length)],
    language: LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)],
    channel: CHANNELS[Math.floor(Math.random() * CHANNELS.length)],
    status: "pending",
    slaRemainingSec: 300, // 5 min SLA per §5.4
  };
}

function scheduleNextEvent() {
  const delay = 25000 + Math.random() * 20000; // 25-45s
  setTimeout(() => {
    const event = makeNewEvent();
    queue.unshift(event);
    if (queue.length > 12) queue.pop();
    console.log(`[crisis-relay] emitting new event: ${event.id} — ${event.reason}`);
    io.emit("crisis:event", event);
    scheduleNextEvent();
  }, delay);
}

// Tick down SLA timers every second
setInterval(() => {
  let changed = false;
  for (const e of queue) {
    if ((e.status === "pending" || e.status === "reviewing") && e.slaRemainingSec > 0) {
      e.slaRemainingSec -= 1;
      changed = true;
    }
  }
  if (changed) {
    io.emit("crisis:tick", queue.map((e) => ({ id: e.id, slaRemainingSec: e.slaRemainingSec })));
  }
}, 1000);

io.on("connection", (socket: Socket) => {
  console.log(`[crisis-relay] supervisor console connected: ${socket.id}`);

  // Send current queue on connect
  socket.emit("crisis:queue", queue);

  // Allow supervisor console to update dispositions
  socket.on("crisis:disposition", (data: { id: string; status: CrisisEvent["status"]; disposition?: string }) => {
    const event = queue.find((e) => e.id === data.id);
    if (event) {
      event.status = data.status;
      event.disposition = data.disposition;
      event.slaRemainingSec = 0;
      io.emit("crisis:update", event);
      console.log(`[crisis-relay] disposition updated: ${event.id} → ${event.status}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`[crisis-relay] supervisor console disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`[crisis-relay] listening on port ${PORT}`);
  scheduleNextEvent();
});
