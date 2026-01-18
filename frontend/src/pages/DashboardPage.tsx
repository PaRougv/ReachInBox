import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import ComposeModal from "../ui/ComposeModal";

type User = {
  name: string;
  email: string;
  avatar?: string;
};

type ScheduledEmail = {
  id: string;
  to: string;
  subject: string;
  body: string;
  scheduledAt: string;
};

type SentEmail = {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  status: "SENT" | "FAILED";
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<"scheduled" | "sent">("scheduled");
  const [composeOpen, setComposeOpen] = useState(false);
  const [loadingMe, setLoadingMe] = useState(true);
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);

  const navigate = useNavigate();

  async function loadMe() {
    try {
      setLoadingMe(true);
      const res = await api.get("/auth/me");
      if (!res.data.user) return navigate("/login");
      setUser(res.data.user);
    } finally {
      setLoadingMe(false);
    }
  }

  async function loadScheduledEmails() {
    try {
      setLoadingEmails(true);
      const res = await api.get("/emails/scheduled");
      setScheduledEmails(res.data.emails || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEmails(false);
    }
  }

  async function loadSentEmails() {
    try {
      setLoadingEmails(true);
      const res = await api.get("/emails/sent");
      setSentEmails(res.data.emails || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEmails(false);
    }
  }

  async function logout() {
    await api.post("/auth/logout");
    navigate("/login");
  }

  function handleComposeClose() {
    setComposeOpen(false);
    // Reload emails after composing to show newly scheduled email
    if (tab === "scheduled") {
      loadScheduledEmails();
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  useEffect(() => {
    if (tab === "scheduled") {
      loadScheduledEmails();
    } else {
      loadSentEmails();
    }
  }, [tab]);

  const currentEmails = tab === "scheduled" ? scheduledEmails : sentEmails;

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.brandCircle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 8L10.89 13.26C11.567 13.672 12.433 13.672 13.11 13.26L21 8M5 19H19C20.105 19 21 18.105 21 17V7C21 5.895 20.105 5 19 5H5C3.895 5 3 5.895 3 7V17C3 18.105 3.895 19 5 19Z" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h2 style={styles.brandTitle}>ReachInbox</h2>
            <p style={styles.brandSub}>Smart Email Scheduling</p>
          </div>
        </div>

        <div style={styles.headerRight}>
          {loadingMe ? (
            <div style={styles.loadingText}>
              <div style={styles.spinner}></div>
              Loading...
            </div>
          ) : user ? (
            <div style={styles.userBox}>
              <div style={styles.userInfo}>
                <div style={styles.userName}>{user.name}</div>
                <div style={styles.userEmail}>{user.email}</div>
              </div>
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=22c55e&color=fff&bold=true&size=128`}
                alt="avatar"
                style={styles.avatar}
              />
              <button style={styles.logoutBtn} onClick={logout}>
                <span style={styles.logoutIcon}>→</span>
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {/* Body */}
      <main style={styles.main}>
        {/* Stats Cards */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⏳</div>
            <div>
              <div style={styles.statValue}>{scheduledEmails.length}</div>
              <div style={styles.statLabel}>Scheduled</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIconSent}>✓</div>
            <div>
              <div style={styles.statValue}>{sentEmails.filter(e => e.status === 'SENT').length}</div>
              <div style={styles.statLabel}>Sent</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIconFailed}>✕</div>
            <div>
              <div style={styles.statValue}>{sentEmails.filter(e => e.status === 'FAILED').length}</div>
              <div style={styles.statLabel}>Failed</div>
            </div>
          </div>
        </div>

        <div style={styles.topRow}>
          <div style={styles.tabs}>
            <button
              style={tab === "scheduled" ? styles.activeTab : styles.tab}
              onClick={() => setTab("scheduled")}
            >
              <span style={styles.tabIcon}>⏳</span>
              Scheduled
              {scheduledEmails.length > 0 && (
                <span style={styles.tabBadge}>{scheduledEmails.length}</span>
              )}
            </button>

            <button
              style={tab === "sent" ? styles.activeTab : styles.tab}
              onClick={() => setTab("sent")}
            >
              <span style={styles.tabIcon}>✉️</span>
              Sent
              {sentEmails.length > 0 && (
                <span style={styles.tabBadge}>{sentEmails.length}</span>
              )}
            </button>
          </div>

          <button style={styles.composeBtn} onClick={() => setComposeOpen(true)}>
            <span style={styles.composePlus}>+</span>
            Compose Email
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.emailListContainer}>
            {loadingEmails ? (
              <div style={styles.loadingEmails}>
                <div style={styles.spinner}></div>
                <span>Loading emails...</span>
              </div>
            ) : currentEmails.length === 0 ? (
              <div style={styles.empty}>
                <div style={styles.emptyIcon}>
                  {tab === "scheduled" ? "📭" : "📬"}
                </div>
                <div style={styles.emptyTitle}>
                  {tab === "scheduled" ? "No scheduled emails" : "No sent emails"}
                </div>
                <div style={styles.emptyText}>
                  {tab === "scheduled"
                    ? "Schedule your first email by clicking 'Compose Email' button"
                    : "Your sent emails will appear here"}
                </div>
              </div>
            ) : (
              <div style={styles.emailList}>
                {currentEmails.map((email) => (
                  <div key={email.id} style={styles.emailRow}>
                    <div style={styles.emailCheckbox}>
                      <input type="checkbox" style={styles.checkbox} />
                    </div>
                    
                    <div style={styles.emailContent}>
                      <div style={styles.emailMeta}>
                        <span style={styles.recipientLabel}>To:</span>
                        <span style={styles.recipient}>{email.to}</span>
                      </div>
                      
                      <div style={styles.emailDetails}>
                        {tab === "scheduled" ? (
                          <span style={styles.scheduledBadge}>
                            <span style={styles.badgeIcon}>🕒</span>
                            {new Date((email as ScheduledEmail).scheduledAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        ) : (
                          <span
                            style={
                              (email as SentEmail).status === "SENT"
                                ? styles.sentBadge
                                : styles.failedBadge
                            }
                          >
                            <span style={styles.badgeIcon}>
                              {(email as SentEmail).status === "SENT" ? "✓" : "✕"}
                            </span>
                            {(email as SentEmail).status}
                          </span>
                        )}
                        
                        <span style={styles.subject}>{email.subject}</span>
                        <span style={styles.divider}>-</span>
                        <span style={styles.preview}>{email.body.substring(0, 80)}...</span>
                      </div>
                    </div>

                    <div style={styles.emailRight}>
                      <div style={styles.timestamp}>
                        {tab === "scheduled"
                          ? new Date((email as ScheduledEmail).scheduledAt).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })
                          : new Date((email as SentEmail).sentAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                      </div>
                      <button style={styles.actionBtn} title="More options">⋯</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Compose Modal - Using imported component */}
      <ComposeModal open={composeOpen} onClose={handleComposeClose} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
  },

  header: {
    background: "#ffffff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    padding: "14px 28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },

  brandCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(22,163,74,0.1))",
    border: "1.5px solid rgba(34,197,94,0.3)",
  },

  brandTitle: {
    margin: 0,
    fontSize: 19,
    fontWeight: 700,
    letterSpacing: "-0.5px",
    color: "#111827",
  },

  brandSub: {
    margin: "2px 0 0 0",
    fontSize: 12,
    color: "#6b7280",
    fontWeight: 500,
  },

  headerRight: {
    display: "flex",
    alignItems: "center",
  },

  loadingText: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#6b7280",
    fontWeight: 600,
    fontSize: 14,
  },

  userBox: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },

  userInfo: {
    textAlign: "right",
  },

  userName: {
    fontWeight: 700,
    color: "#111827",
    fontSize: 14,
  },

  userEmail: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: 500,
    marginTop: 2,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    border: "2px solid rgba(34,197,94,0.2)",
    objectFit: "cover",
  },

  logoutBtn: {
    padding: "8px 16px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    color: "#374151",
    display: "flex",
    alignItems: "center",
    gap: 6,
    transition: "all 0.2s",
  },

  logoutIcon: {
    fontSize: 16,
    transform: "rotate(0deg)",
    transition: "transform 0.2s",
  },

  main: {
    padding: "28px 32px",
    maxWidth: 1200,
    margin: "0 auto",
  },

  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginBottom: 24,
  },

  statCard: {
    background: "#ffffff",
    padding: "18px 20px",
    borderRadius: 14,
    border: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    gap: 14,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },

  statIcon: {
    fontSize: 28,
    background: "linear-gradient(135deg, #fef3c7, #fde68a)",
    width: 52,
    height: 52,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
  },

  statIconSent: {
    fontSize: 24,
    background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
    width: 52,
    height: 52,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    color: "#16a34a",
    fontWeight: 900,
  },

  statIconFailed: {
    fontSize: 24,
    background: "linear-gradient(135deg, #fee2e2, #fecaca)",
    width: 52,
    height: 52,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    color: "#dc2626",
    fontWeight: 900,
  },

  statValue: {
    fontSize: 26,
    fontWeight: 800,
    color: "#111827",
    lineHeight: 1,
  },

  statLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: 600,
    marginTop: 4,
  },

  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
    gap: 16,
  },

  tabs: {
    display: "flex",
    gap: 8,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    padding: 5,
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },

  tab: {
    padding: "10px 18px",
    borderRadius: 9,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    color: "#6b7280",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  activeTab: {
    padding: "10px 18px",
    borderRadius: 9,
    border: "none",
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
    color: "#ffffff",
    boxShadow: "0 4px 12px rgba(34,197,94,0.25)",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  tabIcon: {
    fontSize: 16,
  },

  tabBadge: {
    background: "rgba(255,255,255,0.25)",
    padding: "2px 7px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800,
  },

  composeBtn: {
    padding: "12px 22px",
    borderRadius: 11,
    border: "none",
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
    boxShadow: "0 6px 20px rgba(22,163,74,0.3)",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  composePlus: {
    fontSize: 18,
    fontWeight: 700,
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },

  emailListContainer: {
    minHeight: 300,
  },

  emailList: {
    display: "flex",
    flexDirection: "column",
  },

  emailRow: {
    display: "flex",
    alignItems: "center",
    padding: "14px 18px",
    borderBottom: "1px solid #f3f4f6",
    cursor: "pointer",
    transition: "background 0.15s",
    gap: 12,
  },

  emailCheckbox: {
    display: "flex",
    alignItems: "center",
  },

  checkbox: {
    width: 16,
    height: 16,
    cursor: "pointer",
  },

  emailContent: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  emailMeta: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },

  recipientLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#9ca3af",
  },

  recipient: {
    fontSize: 13,
    fontWeight: 700,
    color: "#111827",
  },

  emailDetails: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    overflow: "hidden",
  },

  scheduledBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: 11,
    fontWeight: 700,
    color: "#d97706",
    background: "#fef3c7",
    padding: "3px 9px",
    borderRadius: 6,
    flexShrink: 0,
  },

  sentBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: 11,
    fontWeight: 700,
    color: "#16a34a",
    background: "#d1fae5",
    padding: "3px 9px",
    borderRadius: 6,
    flexShrink: 0,
  },

  failedBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: 11,
    fontWeight: 700,
    color: "#dc2626",
    background: "#fee2e2",
    padding: "3px 9px",
    borderRadius: 6,
    flexShrink: 0,
  },

  badgeIcon: {
    fontSize: 10,
  },

  subject: {
    fontWeight: 700,
    color: "#111827",
    flexShrink: 0,
  },

  divider: {
    color: "#d1d5db",
    flexShrink: 0,
  },

  preview: {
    color: "#9ca3af",
    fontWeight: 400,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  emailRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },

  timestamp: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: 600,
    minWidth: 70,
    textAlign: "right",
  },

  actionBtn: {
    background: "transparent",
    border: "none",
    fontSize: 18,
    color: "#9ca3af",
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: 6,
    transition: "all 0.15s",
  },

  loadingEmails: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
    gap: 12,
    color: "#6b7280",
    fontWeight: 600,
  },

  spinner: {
    width: 24,
    height: 24,
    border: "3px solid #e5e7eb",
    borderTop: "3px solid #22c55e",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  empty: {
    padding: "80px 20px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 14,
  },

  emptyIcon: {
    fontSize: 56,
    opacity: 0.8,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
  },

  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: 500,
    maxWidth: 360,
  },
};
