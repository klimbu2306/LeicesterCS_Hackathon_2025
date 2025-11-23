"use client";
import { useState, useEffect } from "react";
import { Timeline, TimelineItem, TimelineHeader, TimelineTime, TimelineName, TimelineContent } from "./ui/timeline";
import { generateParkingTimeline, TimelineStep } from "@/utils/parkingSmartLogic";
import { getGeocode, getLatLng } from "use-places-autocomplete";

interface EventParkingTimelineProps {
    homeAddress: string;
    homeLat: number;
    homeLng: number;
    events: any[];
}

export default function EventParkingTimeline({ homeAddress, homeLat, homeLng, events }: EventParkingTimelineProps) {
    const [timeline, setTimeline] = useState<TimelineStep[]>([]);
    const [radius, setRadius] = useState(800);
    const [preference, setPreference] = useState<"cheap" | "closest">("cheap");
    const [loading, setLoading] = useState(false);
    const [futureEventsCount, setFutureEventsCount] = useState(0);
    const [totalCost, setTotalCost] = useState(0);

    useEffect(() => {
        if (homeLat && homeLng && events.length > 0) {
            calculateFullTimeline();
        }
    }, [events, homeLat, homeLng, radius, preference]);

    const calculateFullTimeline = async () => {
        setLoading(true);
        try {
            const now = new Date();
            const upcoming = events.filter((e) => new Date(e.start.dateTime) > now).sort((a, b) => new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime());

            setFutureEventsCount(upcoming.length);

            if (upcoming.length === 0) {
                setTimeline([]);
                setLoading(false);
                return;
            }

            // 1. Batch Geocode ALL events
            const geocodedEvents = await Promise.all(
                upcoming.map(async (evt) => {
                    let lat = 0;
                    let lng = 0;

                    if (evt.location.coordinates && evt.location.coordinates.latitude) {
                        lat = evt.location.coordinates.latitude;
                        lng = evt.location.coordinates.longitude;
                    } else {
                        try {
                            const results = await getGeocode({ address: evt.location.displayName });
                            const coords = await getLatLng(results[0]);
                            lat = coords.lat;
                            lng = coords.lng;
                        } catch (e) {
                            console.warn(`Could not geocode ${evt.subject}`);
                            return null; // Skip failed ones
                        }
                    }

                    return {
                        lat,
                        lng,
                        start: new Date(evt.start.dateTime),
                        end: new Date(evt.end.dateTime),
                        title: evt.subject,
                    };
                })
            );

            const validEvents = geocodedEvents.filter((e) => e !== null) as any[];

            // 2. Generate Timeline
            const steps = generateParkingTimeline({ lat: homeLat, lng: homeLng }, validEvents, radius, preference);

            setTimeline(steps);

            // 3. Calculate Total Cost
            const costSum = steps.reduce((sum, step) => sum + (step.cost || 0), 0);
            setTotalCost(costSum);
        } catch (error) {
            console.error("Timeline Error", error);
        } finally {
            setLoading(false);
        }
    };

    if (futureEventsCount === 0 && !loading) return <div className="bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-neutral-800 p-6 text-center text-gray-500">No upcoming events found for today.</div>;

    return (
        <div className="bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="w-full md:w-auto">
                    <h2 className="text-lg font-bold flex items-center gap-2 mb-1">🚀 Full Day Itinerary</h2>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span>{futureEventsCount} events</span>
                        <span className="text-gray-300 dark:text-gray-700">|</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">Est. Cost: £{totalCost.toFixed(2)}</span>
                    </div>
                </div>

                <div className="flex bg-gray-100 dark:bg-neutral-900 p-1 rounded-lg">
                    <button
                        onClick={() => setPreference("cheap")}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${preference === "cheap" ? "bg-white dark:bg-neutral-800 shadow-sm text-gray-900 dark:text-gray-100" : "text-gray-500"}`}
                    >
                        💰 Cheapest
                    </button>
                    <button
                        onClick={() => setPreference("closest")}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${preference === "closest" ? "bg-white dark:bg-neutral-800 shadow-sm text-gray-900 dark:text-gray-100" : "text-gray-500"}`}
                    >
                        🚶 Closest
                    </button>
                </div>
            </div>

            {/* Slider */}
            <div className="mb-8 px-2">
                <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
                    <span>Max Walk: {radius}m</span>
                    <span>2km</span>
                </div>
                <input
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700 accent-blue-600"
                />
            </div>

            {loading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-4 text-gray-500 animate-pulse">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Calculating optimal route...</span>
                </div>
            ) : (
                <Timeline>
                    {timeline.map((step, idx) => (
                        <TimelineItem key={idx} difficulty={step.difficulty}>
                            <TimelineHeader>
                                <TimelineTime>{step.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</TimelineTime>
                                <TimelineName>
                                    {step.mapLink ? (
                                        <a href={step.mapLink} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 hover:underline flex items-center gap-1 group decoration-2 decoration-blue-500/30">
                                            {step.title}
                                            <svg className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    ) : (
                                        step.title
                                    )}
                                </TimelineName>
                            </TimelineHeader>
                            <TimelineContent>
                                {step.description}
                                {step.cost !== undefined && step.cost > 0 && <div className="mt-1 text-xs font-bold text-green-600 dark:text-green-400">+£{step.cost.toFixed(2)}</div>}
                            </TimelineContent>
                        </TimelineItem>
                    ))}
                </Timeline>
            )}
        </div>
    );
}
