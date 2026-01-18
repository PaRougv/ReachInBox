import { useEffect, useState } from "react";
import { api } from "../api";

type Email = {
  id: string;
  to: string;
  subject: string;
  sentAt?: string;
  status: string;
  previewUrl?: string;
};

export default function SentEmailsTable() {
  const [loading, setLoading] = useState(true);
  const [emails, setEmails] = useState<Email[]>([]);

  async function load() {
    setLoading(true);
    const res = await api.get("/emails/sent");
    setEmails(res.data.emails);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <p>Loading sent emails...</p>;
  if (emails.length === 0) return <p>✅ No sent emails yet.</p>;

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th align="left">Email</th>
          <th align="left">Subject</th>
          <th align="left">Sent time</th>
          <th align="left">Status</th>
          <th align="left">Preview</th>
        </tr>
      </thead>
      <tbody>
        {emails.map((e) => (
          <tr key={e.id}>
            <td>{e.to}</td>
            <td>{e.subject}</td>
            <td>{e.sentAt ? new Date(e.sentAt).toLocaleString() : "-"}</td>
            <td>{e.status}</td>
            <td>
              {e.previewUrl ? (
                <a href={e.previewUrl} target="_blank" rel="noreferrer">
                  View
                </a>
              ) : (
                "-"
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
