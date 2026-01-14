import { BrowserRouter, Routes, Route, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type WhispUser = { id: string; name: string };
type Thought = { id: number; text: string; time: string; reactions: number };

/* ------------ storage utils ------------ */

function getUser(): WhispUser | null {
  return JSON.parse(localStorage.getItem("whisp_user") || "null");
}

function saveUser(user: WhispUser) {
  localStorage.setItem("whisp_user", JSON.stringify(user));
}

function saveThought(userId: string, text: string) {
  const all: Record<string, Thought[]> = JSON.parse(localStorage.getItem("whisp_messages") || "{}");
  if (!all[userId]) all[userId] = [];
  all[userId].unshift({ id: Date.now(), text, time: new Date().toISOString(), reactions: 0 });
  localStorage.setItem("whisp_messages", JSON.stringify(all));
}

function getThoughts(userId: string) {
  const all: Record<string, Thought[]> = JSON.parse(localStorage.getItem("whisp_messages") || "{}");
  return all[userId] || [];
}

function deleteThought(userId: string, thoughtId: number) {
  const all: Record<string, Thought[]> = JSON.parse(localStorage.getItem("whisp_messages") || "{}");
  all[userId] = (all[userId] || []).filter(t => t.id !== thoughtId);
  localStorage.setItem("whisp_messages", JSON.stringify(all));
}

/* ------------ components ------------ */

function BottomNav() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: "fixed",
        bottom: "12px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "92%",
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(14px)",
        borderRadius: "22px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        padding: "10px 14px",
        display: "flex",
        justifyContent: "space-around",
        color: "white",
        fontSize: "14px",
      }}
    >
      <button
        onClick={() => navigate("/")}
        style={{ background: "none", color: "white", border: "none", cursor: "pointer" }}
      >
        Home
      </button>

      <button
        onClick={() => navigate("/me")}
        style={{ background: "none", color: "white", border: "none", cursor: "pointer" }}
      >
        Inbox
      </button>
    </div>
  );
}

/* ------------ Create Account ------------ */

function CreateAccount() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  function create() {
    if (!name.trim()) return;
    const user = { id: crypto.randomUUID(), name };
    saveUser(user);
    navigate("/me");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #312E81, #6D28D9, #DB2777)",
        color: "white",
        padding: "24px",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 400, margin: "0 auto", width: "100%" }}>
        <h1 style={{ fontSize: 46, fontWeight: 900, textAlign: "center", marginBottom: 8 }}>Whisp 👻</h1>

        <p style={{ textAlign: "center", opacity: 0.9, marginBottom: 16 }}>Your anonymous world</p>

        <div
          style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(14px)",
            padding: 20,
            borderRadius: 22,
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <input
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 16,
              border: "none",
              outline: "none",
            }}
            placeholder="Choose a nickname"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={create}
            style={{
              marginTop: 12,
              width: "100%",
              padding: "12px 0",
              background: "#DB2777",
              color: "white",
              borderRadius: 18,
              border: "none",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            Start Whisping ✨
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------ Inbox ------------ */

function MyInbox() {
  const user = getUser();
  const [thoughts, setThoughts] = useState<Thought[]>([]);

  useEffect(() => {
    if (user) setThoughts(getThoughts(user.id));
  }, []);

  if (!user)
    return <div style={{ padding: 24, textAlign: "center", color: "white" }}>No account found</div>;

  const shareLink = `${window.location.origin}/send/${user.id}`;

  function remove(id: number) {
    if (!user) return;
    deleteThought(user.id, id);
    setThoughts(getThoughts(user.id));
  }

  function react(id: number) {
    if (!user) return;
    const all: Record<string, Thought[]> = JSON.parse(localStorage.getItem("whisp_messages") || "{}");
    const item = all[user.id].find(t => t.id === id);
    if (item) item.reactions += 1;
    localStorage.setItem("whisp_messages", JSON.stringify(all));
    setThoughts(getThoughts(user.id));
  }

  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Send me anonymous thoughts on Whisp 👻\n${shareLink}`)}`);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #312E81, #6D28D9, #DB2777)",
        color: "white",
        padding: 24,
        paddingBottom: 90,
      }}
    >
      <BottomNav />

      <h1 style={{ textAlign: "center", fontSize: 28, fontWeight: 800 }}>Inbox 💌</h1>
      <p style={{ textAlign: "center" }}>Hello {user.name}</p>

      <div
        style={{
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(14px)",
          padding: 14,
          borderRadius: 20,
          marginTop: 12,
          marginBottom: 14,
        }}
      >
        <p style={{ fontSize: 12 }}>Your share link</p>

        <div
          style={{
            background: "rgba(0,0,0,0.4)",
            padding: 10,
            borderRadius: 16,
            wordBreak: "break-all",
            fontSize: 11,
          }}
        >
          {shareLink}
        </div>

        <button
          onClick={shareWhatsApp}
          style={{
            marginTop: 8,
            background: "#DB2777",
            color: "white",
            padding: "8px 14px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
          }}
        >
          Share on WhatsApp
        </button>
      </div>

      <h2>Anonymous thoughts</h2>

      <AnimatePresence>
        {thoughts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(14px)",
              padding: 14,
              borderRadius: 20,
              marginBottom: 10,
            }}
          >
            <p>{t.text}</p>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 13 }}>
              <button onClick={() => react(t.id)} style={{ background: "none", border: "none", color: "white" }}>
                ❤️ {t.reactions}
              </button>

              <button onClick={() => remove(t.id)} style={{ background: "none", border: "none", color: "white" }}>
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {thoughts.length === 0 && (
        <p style={{ textAlign: "center", opacity: 0.8, marginTop: 20 }}>No messages yet 🙈</p>
      )}
    </div>
  );
}

/* ------------ Send Thought ------------ */

function SendThought() {
  const { userId } = useParams<{ userId: string }>();
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  function send() {
    if (!text.trim() || !userId) return;
    saveThought(userId, text);
    setSent(true);
    setText("");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #6D28D9, #DB2777)",
        color: "white",
        padding: 24,
        paddingBottom: 80,
      }}
    >
      <BottomNav />

      <h1 style={{ textAlign: "center", fontSize: 28, fontWeight: 800 }}>Whisp 👻</h1>

      {!sent && (
        <div
          style={{
            maxWidth: 400,
            margin: "0 auto",
            background: "rgba(255,255,255,0.12)",
            padding: 16,
            borderRadius: 20,
          }}
        >
          <textarea
            style={{ width: "100%", minHeight: 120, padding: 10, borderRadius: 14 }}
            placeholder="Say anything honestly…"
            value={text}
            onChange={e => setText(e.target.value)}
          />

          <button
            onClick={send}
            style={{
              width: "100%",
              marginTop: 10,
              padding: 12,
              borderRadius: 16,
              border: "none",
              background: "#DB2777",
              color: "white",
              cursor: "pointer",
            }}
          >
            Send anonymously 🚀
          </button>
        </div>
      )}

      {sent && (
        <p style={{ textAlign: "center", marginTop: 30, fontSize: 18 }}>🎉 Sent! Nobody will know it was you.</p>
      )}
    </div>
  );
}

/* ------------ root ------------ */

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateAccount />} />
        <Route path="/me" element={<MyInbox />} />
        <Route path="/send/:userId" element={<SendThought />} />
      </Routes>
    </BrowserRouter>
  );
}
