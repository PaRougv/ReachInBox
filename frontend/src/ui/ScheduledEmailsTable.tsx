import { useEffect, useState } from "react";
import { api } from "../api";

type Email = {
  id: string;
  to: string;
  subject: string;
  sendAt: string;
  status: string;
};

export default function ScheduledEmailsTable() {
  const [loading, setLoading] = useState(true);
  const [emails, setEmails] = useState<Email[]>([]);

  async function load() {
    setLoading(true);
    const res = await api.get("/emails/scheduled");
    setEmails(res.data.emails);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <p>Loading scheduled emails...</p>;
  if (emails.length === 0) return <p>📭 No scheduled emails yet.</p>;

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th align="left">Email</th>
          <th align="left">Subject</th>
          <th align="left">Scheduled time</th>
          <th align="left">Status</th>
        </tr>
      </thead>
      <tbody>
        {emails.map((e) => (
          <tr key={e.id}>
            <td>{e.to}</td>
            <td>{e.subject}</td>
            <td>{new Date(e.sendAt).toLocaleString()}</td>
            <td>{e.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
