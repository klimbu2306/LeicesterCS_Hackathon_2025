"use client";
import { useState, useEffect, useCallback } from "react"; // Added useCallback
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../authConfig";
import { Client } from "@microsoft/microsoft-graph-client";
import { useLoadScript } from "@react-google-maps/api";
import PlacesAutocomplete from "../components/PlacesAutocomplete";
import EventParkingTimeline from "../components/EventParkingTimeline";

const libraries: "places"[] = ["places"];

export default function CalendarPage() {
    const { instance, accounts } = useMsal();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // State for Home Address
    const [homeAddress, setHomeAddress] = useState<{ address: string; lat: number; lng: number } | null>(null);

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "AIzaSyCmNxeWr6XTBW6vwKg642z-DyJ-cnYuSeI",
        libraries,
    });

    // 1. LOAD ADDRESS DATA ON MOUNT
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("user_home_address");
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setHomeAddress(parsed);
                } catch (e) {
                    console.error("Storage parse error", e);
                }
            }
        }
    }, []);

    // 2. FETCH EVENTS LOGIC (Wrapped in useCallback to be stable)
    const fetchEvents = useCallback(async () => {
        if (!accounts[0]) return;

        // Prevent double-fetching if already loading
        setLoading(true);

        try {
            const response = await instance.acquireTokenSilent({
                ...loginRequest,
                account: accounts[0],
            });
            const graphClient = Client.init({
                authProvider: (done) => done(null, response.accessToken),
            });
            const now = new Date();
            const end = new Date();
            end.setDate(now.getDate() + 60);
            const result = await graphClient
                .api("/me/calendarView")
                .query({
                    startDateTime: now.toISOString(),
                    endDateTime: end.toISOString(),
                    $orderby: "start/dateTime",
                })
                .select("subject,start,end,location")
                .get();
            setEvents(result.value);
        } catch (error) {
            console.error("Graph API Error:", error);
        } finally {
            setLoading(false);
        }
    }, [accounts, instance]);

    // 3. AUTO-LOAD CALENDAR ON LOGIN OR REFRESH
    useEffect(() => {
        if (accounts[0]) {
            fetchEvents();
        }
    }, [accounts, fetchEvents]); // Runs whenever 'accounts' changes (login or reload)

    // 4. SAVE ADDRESS DATA
    const handleSetHomeAddress = (address: string, lat: number, lng: number) => {
        const newAddr = { address, lat, lng };
        setHomeAddress(newAddr);
        localStorage.setItem("user_home_address", JSON.stringify(newAddr));
    };

    const clearAddress = () => {
        setHomeAddress(null);
        localStorage.removeItem("user_home_address");
    };

    const handleLogin = () => {
        instance.loginPopup(loginRequest).catch((e) => console.error(e));
    };

    if (!isLoaded) return <div className="flex h-screen items-center justify-center text-gray-500">Loading Google API...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-[#ededed] p-6 md:p-12 font-sans">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your schedule and preferences.</p>
                </div>
                {!accounts[0] ? (
                    <button onClick={handleLogin} className="bg-[#0078D4] hover:bg-[#006cbd] text-white px-6 py-2.5 rounded-lg font-medium shadow-md shadow-blue-500/20">
                        Sign In with Microsoft
                    </button>
                ) : (
                    <div className="flex items-center gap-4 bg-white dark:bg-[#0a0a0a] px-4 py-2 rounded-full border border-gray-200 dark:border-neutral-800 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-sm font-medium">{accounts[0].username}</span>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* SETTINGS COLUMN */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span className="text-xl">🏠</span> Home Address
                        </h2>

                        {homeAddress && (
                            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg">
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">Saved Address</p>
                                <p className="text-sm font-medium leading-relaxed">{homeAddress.address}</p>
                                <button onClick={clearAddress} className="text-xs text-red-500 hover:text-red-600 mt-3 font-medium underline decoration-red-500/30">
                                    Remove Address
                                </button>
                            </div>
                        )}

                        <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">{homeAddress ? "Update Address" : "Search Address"}</label>

                        <div className="relative">
                            <PlacesAutocomplete onSelect={handleSetHomeAddress} initialValue={homeAddress?.address || ""} />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">* You must click a suggestion from the dropdown to save.</p>
                    </div>
                </div>

                {/* CALENDAR COLUMN */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm min-h-[500px]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <span className="text-xl">📅</span> Upcoming Events
                            </h2>
                            {accounts[0] && (
                                <button onClick={fetchEvents} disabled={loading} className="text-sm px-4 py-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-lg font-medium transition-colors disabled:opacity-50">
                                    {loading ? "Syncing..." : "Refresh Calendar"}
                                </button>
                            )}
                        </div>

                        {!accounts[0] ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-gray-200 dark:border-neutral-800 rounded-xl">
                                <p className="text-gray-400">Please sign in to view your calendar.</p>
                            </div>
                        ) : events.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                {loading ? <p className="text-gray-500 dark:text-gray-400">Loading events...</p> : <p className="text-gray-500 dark:text-gray-400">No upcoming events found (or click Refresh).</p>}
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-neutral-800">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 dark:bg-neutral-900 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-neutral-800">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Event</th>
                                            <th className="px-6 py-4 font-medium">Date & Time</th>
                                            <th className="px-6 py-4 font-medium">Location</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                                        {events.map((evt) => (
                                            <tr key={evt.id} className="hover:bg-gray-50 dark:hover:bg-neutral-900/50 transition-colors">
                                                <td className="px-6 py-4 font-medium">{evt.subject}</td>
                                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                    <div className="flex flex-col">
                                                        <span>{new Date(evt.start.dateTime).toLocaleDateString()}</span>
                                                        <span className="text-xs opacity-70">
                                                            {new Date(evt.start.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {new Date(evt.end.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{evt.location.displayName || <span className="italic opacity-50">Remote / TBD</span>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            
                {homeAddress && events.length > 0 && (
                    <div className="mt-8 lg:col-span-3">
                        <EventParkingTimeline homeAddress={homeAddress.address} homeLat={homeAddress.lat} homeLng={homeAddress.lng} events={events} />
                    </div>
                )}
            </div>
        </div>
    );
}
