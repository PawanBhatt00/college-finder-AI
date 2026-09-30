"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Send, Bot, User, Loader2, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const SUGGESTED = [
  "What is the closing rank for CSE at NIT Trichy for General category?",
  "Which IIT has the highest placement package?",
  "Compare fees between IIT Bombay and IIT Delhi",
  "What are the cutoffs for IIIT Hyderabad Computer Science?",
];

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);

  const getMessageId = () => {
    const id = messageIdRef.current;
    messageIdRef.current += 1;
    return `message-${id}`;
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/chat");
    }
  }, [status, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (question: string) => {
    if (!question.trim() || loading) return;

    const userMsg: Message = {
      id: getMessageId(),
      role: "user",
      content: question,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const json = await res.json();

      const assistantMsg: Message = {
        id: getMessageId(),
        role: "assistant",
        content: json.answer ?? "I couldn't generate a response.",
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: getMessageId(),
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <Loader2
          size={24}
          style={{ animation: "spin 1s linear infinite" }}
          color="var(--brand)"
        />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div
      className="page-enter"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 60px)",
      }}
    >
      <div
        className="container"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "1.5rem 1.5rem 0",
          maxWidth: "800px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div style={{ marginBottom: "1.25rem" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "var(--text)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.25rem",
            }}
          >
            <MessageSquare size={22} color="var(--brand)" />
            AI Chat
          </h1>

          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-muted)",
            }}
          >
            Answers are grounded strictly in our college database. No
            guessing.
          </p>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            paddingBottom: "1rem",
          }}
        >
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginTop: "1rem" }}
            >
              <div
                className="card"
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    background: "var(--gradient)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem",
                  }}
                >
                  <Bot size={28} color="white" />
                </div>

                <h2
                  style={{
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Ask me anything about admissions
                </h2>

                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.9rem",
                  }}
                >
                  I&apos;ll answer using only our verified cutoff, fee, and
                  placement data.
                </p>
              </div>

              <div style={{ display: "grid", gap: "0.5rem" }}>
                <p
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "var(--text-subtle)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "0.25rem",
                  }}
                >
                  Try asking:
                </p>

                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    style={{
                      textAlign: "left",
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: "10px",
                      padding: "0.75rem 1rem",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      color: "var(--text-muted)",
                      transition: "all 0.2s",
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--brand)";
                      e.currentTarget.style.color = "var(--text)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.color = "var(--text-muted)";
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "flex-start",
                  flexDirection:
                    msg.role === "user" ? "row-reverse" : "row",
                }}
              >
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    background:
                      msg.role === "user"
                        ? "var(--gradient)"
                        : "var(--bg-muted)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color:
                      msg.role === "user"
                        ? "white"
                        : "var(--text-muted)",
                  }}
                >
                  {msg.role === "user" ? (
                    <User size={15} />
                  ) : (
                    <Bot size={15} />
                  )}
                </div>

                <div
                  style={{
                    maxWidth: "75%",
                    background:
                      msg.role === "user"
                        ? "var(--gradient)"
                        : "var(--bg-card)",
                    color: msg.role === "user" ? "white" : "var(--text)",
                    border:
                      msg.role === "user"
                        ? "none"
                        : "1px solid var(--border)",
                    borderRadius:
                      msg.role === "user"
                        ? "16px 4px 16px 16px"
                        : "4px 16px 16px 16px",
                    padding: "0.875rem 1rem",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                display: "flex",
                gap: "0.75rem",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "var(--bg-muted)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bot size={15} color="var(--text-muted)" />
              </div>

              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "4px 16px 16px 16px",
                  padding: "0.875rem 1rem",
                  display: "flex",
                  gap: "0.4rem",
                  alignItems: "center",
                }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: "var(--text-subtle)",
                      animation: `bounce 1.2s ease-in-out ${
                        i * 0.2
                      }s infinite`,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        <div
          style={{
            borderTop: "1px solid var(--border)",
            padding: "1rem 0",
            display: "flex",
            gap: "0.75rem",
            alignItems: "flex-end",
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Ask about cutoffs, fees, placements... (Enter to send)"
            rows={1}
            style={{
              flex: 1,
              background: "var(--bg-card)",
              border: "1.5px solid var(--border)",
              borderRadius: "12px",
              padding: "0.75rem 1rem",
              color: "var(--text)",
              fontSize: "0.9rem",
              outline: "none",
              resize: "none",
              lineHeight: 1.5,
              transition: "border-color 0.2s",
              fontFamily: "inherit",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--brand)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          />

          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="btn-primary"
            style={{
              padding: "0.75rem",
              borderRadius: "12px",
              flexShrink: 0,
            }}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}