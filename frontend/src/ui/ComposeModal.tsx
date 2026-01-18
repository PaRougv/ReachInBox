import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Sender = { id: string; name: string; email: string };

function extractEmails(text: string) {
  const regex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(regex) || [];
  return Array.from(new Set(matches.map((e) => e.trim().toLowerCase())));
}

export default function ComposeModal({ open, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [senders, setSenders] = useState<Sender[]>([]);
  const [senderId, setSenderId] = useState("");

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("<b>Hello 👋</b><br/>This is ReachInbox.");
  const [startAt, setStartAt] = useState("");

  const [delayBetweenMs, setDelayBetweenMs] = useState(2000);
  const [hourlyLimit, setHourlyLimit] = useState(200);

  const [fileText, setFileText] = useState("");
  const leads = useMemo(() => extractEmails(fileText), [fileText]);

  const [fileName, setFileName] = useState("");

  const [loadingSenders, setLoadingSenders] = useState(false);
  const [creatingSender, setCreatingSender] = useState(false);
  const [scheduling, setScheduling] = useState(false);

  async function loadSenders() {
    try {
      setLoadingSenders(true);
      const res = await api.get("/senders");
      setSenders(res.data.senders || []);
      if (res.data.senders?.length > 0) setSenderId(res.data.senders[0].id);
    } finally {
      setLoadingSenders(false);
    }
  }

  useEffect(() => {
    if (open) loadSenders();
  }, [open]);

  async function handleFile(file: File) {
    const text = await file.text();
    setFileText(text);
  }

  async function createEtherealSender() {
    try {
      setCreatingSender(true);
      await api.post("/senders/create-ethereal", { name: "New Ethereal Sender" });
      await loadSenders();
    } finally {
      setCreatingSender(false);
    }
  }

  async function scheduleBulk() {
    if (!senderId) return alert("No sender found!");
    if (!subject.trim()) return alert("Subject required!");
    if (!startAt) return alert("Start time required!");
    if (leads.length === 0) return alert("Upload CSV/TXT with emails!");

    try {
      setScheduling(true);

      await api.post("/emails/bulk-schedule", {
        senderId,
        subject,
        body,
        startAt: new Date(startAt).toISOString(),
        delayBetweenMs,
        hourlyLimit,
        leads,
      });

      alert(`✅ Scheduled ${leads.length} emails`);
      onClose();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to schedule emails");
    } finally {
      setScheduling(false);
    }
  }

  if (!open) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.iconCircle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 8L10.89 13.26C11.567 13.672 12.433 13.672 13.11 13.26L21 8M5 19H19C20.105 19 21 18.105 21 17V7C21 5.895 20.105 5 19 5H5C3.895 5 3 5.895 3 7V17C3 18.105 3.895 19 5 19Z" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h2 style={styles.title}>Compose Email Campaign</h2>
              <p style={styles.subtitle}>Schedule bulk emails with smart delivery controls</p>
            </div>
          </div>

          <button style={styles.closeBtn} onClick={onClose}>
            <span style={styles.closeBtnIcon}>✕</span>
          </button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {/* Stats Bar */}
          <div style={styles.statsBar}>
            <div style={styles.statItem}>
              <span style={styles.statIcon}>📧</span>
              <div>
                <div style={styles.statValue}>{leads.length}</div>
                <div style={styles.statLabel}>Recipients</div>
              </div>
            </div>

            <div style={styles.statDivider}></div>

            <div style={styles.statItem}>
              <span style={styles.statIcon}>⏱️</span>
              <div>
                <div style={styles.statValue}>{delayBetweenMs / 1000}s</div>
                <div style={styles.statLabel}>Delay</div>
              </div>
            </div>

            <div style={styles.statDivider}></div>

            <div style={styles.statItem}>
              <span style={styles.statIcon}>📊</span>
              <div>
                <div style={styles.statValue}>{hourlyLimit}/hr</div>
                <div style={styles.statLabel}>Rate Limit</div>
              </div>
            </div>
          </div>

          {/* Sender Section */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Sender Configuration</h3>
              <button
                onClick={createEtherealSender}
                style={styles.addSenderBtn}
                disabled={creatingSender}
              >
                {creatingSender ? (
                  <>
                    <div style={styles.miniSpinner}></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <span>+</span>
                    New Sender
                  </>
                )}
              </button>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>👤</span>
                Select Sender
              </label>
              <select
                value={senderId}
                onChange={(e) => setSenderId(e.target.value)}
                style={styles.select}
                disabled={loadingSenders}
              >
                {loadingSenders ? (
                  <option>Loading senders...</option>
                ) : senders.length === 0 ? (
                  <option>No senders available</option>
                ) : (
                  senders.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Email Content */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Email Content</h3>

            <div style={styles.fieldGrid}>
              <div style={styles.field}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>📝</span>
                  Subject Line
                </label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={styles.input}
                  placeholder="e.g., Welcome to ReachInbox!"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>🕐</span>
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>✉️</span>
                Email Body (HTML)
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                style={styles.textarea}
                placeholder="Write your email content here..."
                rows={6}
              />
            </div>
          </div>

          {/* Recipients Upload */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Recipients</h3>

            <div style={styles.uploadArea}>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setFileName(f.name);
                  handleFile(f);
                }}
              />

              {fileName ? (
                <div style={styles.fileUploaded}>
                  <div style={styles.fileIcon}>📄</div>
                  <div style={styles.fileDetails}>
                    <div style={styles.fileName}>{fileName}</div>
                    <div style={styles.fileSuccess}>
                      ✓ {leads.length} email{leads.length !== 1 ? "s" : ""} detected
                    </div>
                  </div>
                  <button
                    style={styles.changeFileBtn}
                    onClick={() => fileRef.current?.click()}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div style={styles.uploadPlaceholder}>
                  <div style={styles.uploadIcon}>📤</div>
                  <div style={styles.uploadText}>
                    <div style={styles.uploadTitle}>Upload recipient list</div>
                    <div style={styles.uploadSubtext}>
                      CSV or TXT file containing email addresses
                    </div>
                  </div>
                  <button
                    style={styles.uploadBtn}
                    onClick={() => fileRef.current?.click()}
                  >
                    Choose File
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Advanced Settings */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Delivery Settings</h3>

            <div style={styles.fieldGrid}>
              <div style={styles.advancedField}>
                <div style={styles.advancedHeader}>
                  <span style={styles.advancedIcon}>⏱️</span>
                  <div>
                    <div style={styles.advancedLabel}>Delay Between Emails</div>
                    <div style={styles.advancedSubtext}>
                      Time gap between each email send
                    </div>
                  </div>
                </div>
                <div style={styles.inputGroup}>
                  <input
                    type="number"
                    value={delayBetweenMs}
                    onChange={(e) => setDelayBetweenMs(Number(e.target.value))}
                    style={styles.numberInput}
                  />
                  <span style={styles.inputSuffix}>ms</span>
                </div>
              </div>

              <div style={styles.advancedField}>
                <div style={styles.advancedHeader}>
                  <span style={styles.advancedIcon}>🚦</span>
                  <div>
                    <div style={styles.advancedLabel}>Hourly Rate Limit</div>
                    <div style={styles.advancedSubtext}>
                      Maximum emails per hour
                    </div>
                  </div>
                </div>
                <div style={styles.inputGroup}>
                  <input
                    type="number"
                    value={hourlyLimit}
                    onChange={(e) => setHourlyLimit(Number(e.target.value))}
                    style={styles.numberInput}
                  />
                  <span style={styles.inputSuffix}>/ hr</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button style={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>

          <button
            style={{
              ...styles.scheduleBtn,
              opacity: scheduling ? 0.7 : 1,
              cursor: scheduling ? "not-allowed" : "pointer",
            }}
            onClick={scheduleBulk}
            disabled={scheduling}
          >
            {scheduling ? (
              <>
                <div style={styles.btnSpinner}></div>
                Scheduling...
              </>
            ) : (
              <>
                <span style={styles.scheduleIcon}>✓</span>
                Schedule {leads.length} Email{leads.length !== 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(8px)",
    display: "grid",
    placeItems: "center",
    padding: 20,
    zIndex: 1000,
    animation: "fadeIn 0.2s ease",
  },

  modal: {
    width: "100%",
    maxWidth: 850,
    maxHeight: "92vh",
    display: "flex",
    flexDirection: "column",
    background: "#ffffff",
    borderRadius: 20,
    boxShadow: "0 25px 80px rgba(0,0,0,0.3)",
    overflow: "hidden",
    animation: "slideUp 0.3s ease",
  },

  header: {
    padding: "20px 24px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    background: "linear-gradient(to bottom, #ffffff, #f9fafb)",
  },

  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },

  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(22,163,74,0.08))",
    border: "1.5px solid rgba(34,197,94,0.25)",
    display: "grid",
    placeItems: "center",
  },

  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 800,
    color: "#111827",
    letterSpacing: "-0.3px",
  },

  subtitle: {
    margin: "4px 0 0 0",
    fontSize: 13,
    color: "#6b7280",
    fontWeight: 500,
  },

  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    transition: "all 0.2s",
  },

  closeBtnIcon: {
    fontSize: 18,
    fontWeight: 600,
    color: "#6b7280",
  },

  body: {
    padding: "24px",
    overflowY: "auto",
    flex: 1,
  },

  statsBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
    padding: "16px 20px",
    borderRadius: 14,
    marginBottom: 24,
    border: "1px solid rgba(34,197,94,0.15)",
  },

  statItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  statIcon: {
    fontSize: 24,
  },

  statValue: {
    fontSize: 20,
    fontWeight: 800,
    color: "#111827",
    lineHeight: 1,
  },

  statLabel: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: 600,
    marginTop: 3,
  },

  statDivider: {
    width: 1,
    height: 32,
    background: "#d1d5db",
  },

  section: {
    marginBottom: 24,
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  sectionTitle: {
    margin: 0,
    fontSize: 15,
    fontWeight: 800,
    color: "#111827",
  },

  addSenderBtn: {
    padding: "7px 12px",
    borderRadius: 9,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
    color: "#374151",
    display: "flex",
    alignItems: "center",
    gap: 6,
    transition: "all 0.2s",
  },

  miniSpinner: {
    width: 12,
    height: 12,
    border: "2px solid #e5e7eb",
    borderTop: "2px solid #22c55e",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
  },

  field: {
    marginBottom: 16,
  },

  fieldGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginBottom: 16,
  },

  label: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontWeight: 700,
    color: "#374151",
    marginBottom: 8,
  },

  labelIcon: {
    fontSize: 14,
  },

  input: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    border: "1.5px solid #e5e7eb",
    fontSize: 14,
    fontWeight: 500,
    color: "#111827",
    outline: "none",
    transition: "all 0.2s",
    boxSizing: "border-box",
  },

  select: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    border: "1.5px solid #e5e7eb",
    fontSize: 14,
    fontWeight: 600,
    color: "#111827",
    outline: "none",
    background: "#ffffff",
    cursor: "pointer",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1.5px solid #e5e7eb",
    fontSize: 14,
    fontWeight: 500,
    color: "#111827",
    outline: "none",
    resize: "vertical",
    fontFamily: "monospace",
    lineHeight: 1.6,
    boxSizing: "border-box",
  },

  uploadArea: {
    border: "2px dashed #d1d5db",
    borderRadius: 12,
    padding: 20,
    background: "#f9fafb",
  },

  uploadPlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    padding: "20px 0",
  },

  uploadIcon: {
    fontSize: 40,
    opacity: 0.7,
  },

  uploadText: {
    textAlign: "center",
  },

  uploadTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 4,
  },

  uploadSubtext: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: 500,
  },

  uploadBtn: {
    padding: "10px 20px",
    borderRadius: 10,
    border: "1.5px solid #22c55e",
    background: "#ffffff",
    color: "#16a34a",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    transition: "all 0.2s",
  },

  fileUploaded: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "#ffffff",
    padding: "14px 16px",
    borderRadius: 10,
    border: "1.5px solid #22c55e",
  },

  fileIcon: {
    fontSize: 32,
  },

  fileDetails: {
    flex: 1,
  },

  fileName: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 3,
  },

  fileSuccess: {
    fontSize: 12,
    fontWeight: 600,
    color: "#16a34a",
  },

  changeFileBtn: {
    padding: "7px 14px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
    color: "#374151",
  },

  advancedField: {
    background: "#f9fafb",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
  },

  advancedHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },

  advancedIcon: {
    fontSize: 20,
  },

  advancedLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "#111827",
  },

  advancedSubtext: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: 500,
    marginTop: 2,
  },

  inputGroup: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  numberInput: {
    flex: 1,
    padding: "9px 12px",
    borderRadius: 8,
    border: "1.5px solid #e5e7eb",
    fontSize: 15,
    fontWeight: 700,
    color: "#111827",
    outline: "none",
    background: "#ffffff",
  },

  inputSuffix: {
    fontSize: 13,
    fontWeight: 700,
    color: "#6b7280",
  },

  footer: {
    padding: "16px 24px",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    background: "#f9fafb",
  },

  cancelBtn: {
    padding: "11px 20px",
    borderRadius: 10,
    border: "1.5px solid #e5e7eb",
    background: "#ffffff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    color: "#374151",
    transition: "all 0.2s",
  },

  scheduleBtn: {
    padding: "11px 24px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 800,
    boxShadow: "0 4px 14px rgba(34,197,94,0.35)",
    display: "flex",
    alignItems: "center",
    gap: 8,
    transition: "all 0.2s",
  },

  scheduleIcon: {
    fontSize: 16,
    fontWeight: 900,
  },

  btnSpinner: {
    width: 14,
    height: 14,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #ffffff",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
  },
};
