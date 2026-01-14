import { BrowserRouter, Routes, Route, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./supabaseClient";

type WhispUser = { id: string; name: string };
type Thought = { id: number; text: string; created_at: string; reactions: number };

/* ------------ storage utils ------------ */

// Keep user info in localStorage (for session management)
function getUser(): WhispUser | null {
  return JSON.parse(localStorage.getItem("whisp_user") || "null");
}

function saveUserLocally(user: WhispUser) {
  localStorage.setItem("whisp_user", JSON.stringify(user));
}

// Supabase functions
async function createUser(name: string): Promise<WhispUser | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .insert({ name })
      .select()
      .single();

    if (error) {
      console.error("Error creating user:", error);
      return null;
    }

    const user = { id: data.id, name: data.name };
    saveUserLocally(user);
    return user;
  } catch (err) {
    console.error("Error:", err);
    return null;
  }
}

async function saveThought(userId: string, text: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("thoughts")
      .insert({ user_id: userId, text });

    if (error) {
      console.error("Error saving thought:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error:", err);
    return false;
  }
}

async function getThoughts(userId: string): Promise<Thought[]> {
  try {
    const { data, error } = await supabase
      .from("thoughts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching thoughts:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error:", err);
    return [];
  }
}

async function deleteThought(thoughtId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("thoughts")
      .delete()
      .eq("id", thoughtId);

    if (error) {
      console.error("Error deleting thought:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error:", err);
    return false;
  }
}

async function updateReactions(thoughtId: number, newReactions: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("thoughts")
      .update({ reactions: newReactions })
      .eq("id", thoughtId);

    if (error) {
      console.error("Error updating reactions:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error:", err);
    return false;
  }
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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function create() {
    if (!name.trim()) return;
    setLoading(true);
    const user = await createUser(name.trim());
    setLoading(false);

    if (user) {
      navigate("/me");
    } else {
      alert("Failed to create account. Please try again.");
    }
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
            disabled={loading}
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={create}
            disabled={loading}
            style={{
              marginTop: 12,
              width: "100%",
              padding: "12px 0",
              background: loading ? "#666" : "#DB2777",
              color: "white",
              borderRadius: 18,
              border: "none",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            {loading ? "Creating..." : "Start Whisping ✨"}
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThoughts();
  }, []);

  async function loadThoughts() {
    if (!user) return;
    setLoading(true);
    const data = await getThoughts(user.id);
    setThoughts(data);
    setLoading(false);
  }

  if (!user)
    return <div style={{ padding: 24, textAlign: "center", color: "white" }}>No account found</div>;

  const shareLink = `${window.location.origin}${import.meta.env.BASE_URL}send/${user.id}`;

  async function remove(id: number) {
    const success = await deleteThought(id);
    if (success) {
      loadThoughts();
    }
  }

  async function react(thought: Thought) {
    const newReactions = thought.reactions + 1;
    const success = await updateReactions(thought.id, newReactions);
    if (success) {
      loadThoughts();
    }
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

      {loading && <p style={{ textAlign: "center", opacity: 0.8 }}>Loading...</p>}

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
              <button onClick={() => react(t)} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}>
                ❤️ {t.reactions}
              </button>

              <button onClick={() => remove(t.id)} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}>
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {!loading && thoughts.length === 0 && (
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
  const [sending, setSending] = useState(false);

  async function send() {
    if (!text.trim() || !userId) return;
    setSending(true);
    const success = await saveThought(userId, text.trim());
    setSending(false);

    if (success) {
      setSent(true);
      setText("");
    } else {
      alert("Failed to send message. Please try again.");
    }
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
            disabled={sending}
          />

          <button
            onClick={send}
            disabled={sending}
            style={{
              width: "100%",
              marginTop: 10,
              padding: 12,
              borderRadius: 16,
              border: "none",
              background: sending ? "#666" : "#DB2777",
              color: "white",
              cursor: sending ? "not-allowed" : "pointer",
            }}
          >
            {sending ? "Sending..." : "Send anonymously 🚀"}
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
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<CreateAccount />} />
        <Route path="/me" element={<MyInbox />} />
        <Route path="/send/:userId" element={<SendThought />} />
      </Routes>
    </BrowserRouter>
  );
}
