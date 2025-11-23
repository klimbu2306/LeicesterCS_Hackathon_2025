"use client";
import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../authConfig";
import { Client } from "@microsoft/microsoft-graph-client";

export default function CalendarPage() {
    const { instance, accounts } = useMsal();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // 1. Authentication (Replaces Connect-MgGraph)
    const handleLogin = () => {
        instance.loginPopup(loginRequest).catch((e) => console.error(e));
    };

    const fetchEvents = async () => {
        if (!accounts[0]) return;
        setLoading(true);

        try {
            // 2. Get Token silently
            const response = await instance.acquireTokenSilent({
                ...loginRequest,
                account: accounts[0],
            });

            // 3. Initialize Graph Client (Replaces Invoke-MgGraphRequest)
            const graphClient = Client.init({
                authProvider: (done) => {
                    done(null, response.accessToken);
                },
            });

            // 4. Define Date Range (Replaces $start/$end logic)
            const now = new Date();
            const end = new Date();
            end.setDate(now.getDate() + 60); // AddDays(60)

            // 5. Query Graph (Replaces the URL construction and GET request)
            // equivalent to: /me/calendarView?startDateTime=...&endDateTime=...
            const result = await graphClient
                .api("/me/calendarView")
                .query({
                    startDateTime: now.toISOString(),
                    endDateTime: end.toISOString(),
                    $orderby: "start/dateTime", // Note the $ must be quoted in JS
                })
                .select("subject,start,end,location") // Select-Object equivalent
                .get();

            setEvents(result.value);
        } catch (error) {
            console.error("Error fetching events", error);
        } finally {
            setLoading(false);
        }
    };

    // View Layer
    return (
        <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <h1>Outlook Calendar Events</h1>

            {!accounts[0] ? (
                <button onClick={handleLogin} style={btnStyle}>
                    Sign In with Microsoft
                </button>
            ) : (
                <div>
                    <p>
                        Signed in as: <strong>{accounts[0].username}</strong>
                    </p>
                    <button onClick={fetchEvents} disabled={loading} style={btnStyle}>
                        {loading ? "Loading..." : "Fetch Events"}
                    </button>
                </div>
            )}

            {/* Replaces Format-Table */}
            {events.length > 0 && (
                <table style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "2px solid #ccc", textAlign: "left" }}>
                            <th>Subject</th>
                            <th>Start</th>
                            <th>End</th>
                            <th>Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((evt) => (
                            <tr key={evt.id} style={{ borderBottom: "1px solid #eee" }}>
                                <td>{evt.subject}</td>
                                <td>{new Date(evt.start.dateTime).toLocaleString()}</td>
                                <td>{new Date(evt.end.dateTime).toLocaleString()}</td>
                                <td>{evt.location.displayName || "N/A"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

const btnStyle = {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#0078D4",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
};
