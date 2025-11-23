import parkingData from "../parkingLocations.json";

export interface ParkingLocation {
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    openCloseTimes: string;
    busyHours: string[];
    prices: string;
}

export interface TimelineStep {
    time: Date;
    title: string;
    description: string;
    type: "drive" | "park" | "walk" | "event" | "relocate";
    difficulty?: "Beginner" | "Intermediate" | "Advanced";
    mapLink?: string;
    cost?: number;
}

// --- Helpers ---

export function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

function getMaxFreeHours(description: string): number {
    const match = description.match(/(\d+)\s*hour\s*free/i);
    if (match) return parseInt(match[1]);
    return 99;
}

// UPDATE: Enforce 1-hour increments for pricing
function estimateParkingCost(priceString: string, durationHours: number): number {
    const str = priceString.toLowerCase();
    if (str.includes("free")) return 0;

    // Always round up to the nearest whole hour (e.g., 1.1 hours -> 2 hours)
    const billableHours = Math.ceil(durationHours);

    // Complex case: "£1.30 first hour, +20p per additional hour"
    if (str.includes("first hour") && str.includes("additional hour")) {
        const firstHourMatch = str.match(/£(\d+\.?\d*)/);
        const additionalMatch = str.match(/(\d+)p/);

        if (firstHourMatch && additionalMatch) {
            const firstHourCost = parseFloat(firstHourMatch[1]);
            const additionalCost = parseInt(additionalMatch[1]) / 100; // Convert pence to pounds

            if (billableHours <= 1) return firstHourCost;
            return firstHourCost + additionalCost * (billableHours - 1);
        }
    }

    // Standard "£X / hour"
    const hourlyMatch = str.match(/£(\d+\.?\d*)\s*\/\s*hour/);
    if (hourlyMatch) {
        return parseFloat(hourlyMatch[1]) * billableHours;
    }

    // Block "£X / Y hours" (e.g. £2 / 3 hours)
    // If duration is 4 hours, you need 2 blocks (6 hours paid capacity)
    const blockMatch = str.match(/£(\d+\.?\d*)\s*\/\s*(\d+)\s*hours?/);
    if (blockMatch) {
        const cost = parseFloat(blockMatch[1]);
        const blockDuration = parseFloat(blockMatch[2]);
        const blocksNeeded = Math.ceil(durationHours / blockDuration);
        return cost * blocksNeeded;
    }

    return 0;
}

function parseTime(timeStr: string, baseDate: Date): Date {
    const d = new Date(baseDate);
    const [time, modifier] = timeStr.trim().split(" ");
    let [hours, minutes] = time.split(":");
    let h = parseInt(hours);
    if (modifier.toLowerCase() === "pm" && h < 12) h += 12;
    if (modifier.toLowerCase() === "am" && h === 12) h = 0;
    d.setHours(h, parseInt(minutes), 0, 0);
    return d;
}

function getDirectionsLink(origin: { lat: number; lng: number }, dest: { lat: number; lng: number }, mode: "driving" | "walking") {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${dest.lat},${dest.lng}&travelmode=${mode}`;
}

function getLocationLink(lat: number, lng: number) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

function isParkingOpen(parking: ParkingLocation, date: Date): boolean {
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    const schedule = parking.openCloseTimes.split("<br>").find((s) => s.startsWith(dayName));
    if (!schedule || schedule.includes("Closed")) return false;
    try {
        const timeRange = schedule.split(" : ")[1];
        if (timeRange.includes("00:00 am - 11:59 pm")) return true;
        const [startStr, endStr] = timeRange.split(" - ");
        const startTime = parseTime(startStr, date);
        const endTime = parseTime(endStr, date);
        if (endTime < startTime) endTime.setDate(endTime.getDate() + 1);
        return date >= startTime && date <= endTime;
    } catch (e) {
        return true;
    }
}

// --- Core Logic ---

function findBestSpot(target: { lat: number; lng: number; start: Date }, maxRadius: number, preference: "cheap" | "closest"): ParkingLocation | null {
    const validSpots = (parkingData as ParkingLocation[]).filter((p) => {
        const dist = getDistanceFromLatLonInM(p.latitude, p.longitude, target.lat, target.lng);
        const isOpenStart = isParkingOpen(p, target.start);
        return dist <= maxRadius && isOpenStart;
    });

    if (validSpots.length === 0) return null;

    validSpots.sort((a, b) => {
        const distA = getDistanceFromLatLonInM(a.latitude, a.longitude, target.lat, target.lng);
        const distB = getDistanceFromLatLonInM(b.latitude, b.longitude, target.lat, target.lng);
        const priceA = a.prices.toLowerCase().includes("free") ? 0 : 1;
        const priceB = b.prices.toLowerCase().includes("free") ? 0 : 1;

        if (preference === "closest") return distA - distB;
        if (preference === "cheap") {
            if (priceA !== priceB) return priceA - priceB;
            return distA - distB;
        }
        return 0;
    });

    return validSpots[0];
}

export function generateParkingTimeline(home: { lat: number; lng: number }, events: { lat: number; lng: number; start: Date; end: Date; title: string }[], maxRadiusMeters: number, preference: "cheap" | "closest"): TimelineStep[] {
    const timeline: TimelineStep[] = [];

    let previousLocation = { lat: home.lat, lng: home.lng, name: "Home" };

    const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());

    sortedEvents.forEach((event, index) => {
        const bestSpot = findBestSpot(event, maxRadiusMeters, preference);

        if (!bestSpot) {
            timeline.push({
                time: event.start,
                title: `No Parking for ${event.title}`,
                description: "Try increasing radius.",
                type: "drive",
                difficulty: "Advanced",
            });
            return;
        }

        // 1. Constants
        const driveSpeedMpS = 13.4;
        const walkSpeedMpS = 1.4;

        const distPrevToPark = getDistanceFromLatLonInM(previousLocation.lat, previousLocation.lng, bestSpot.latitude, bestSpot.longitude);
        const distParkToEvent = getDistanceFromLatLonInM(bestSpot.latitude, bestSpot.longitude, event.lat, event.lng);

        const driveTimeSec = distPrevToPark / driveSpeedMpS;
        const walkTimeSec = distParkToEvent / walkSpeedMpS;

        // 2. Calculate Times
        const arrivalAtEvent = new Date(event.start.getTime() - 15 * 60000);
        const arriveAtPark = new Date(arrivalAtEvent.getTime() - walkTimeSec * 1000);
        const leavePrevious = new Date(arriveAtPark.getTime() - driveTimeSec * 1000);

        // 3. Relocation Check & Cost Calc
        const parkingDurationHours = (event.end.getTime() - arriveAtPark.getTime()) / 3600000;
        const maxFree = getMaxFreeHours(bestSpot.description);
        let estimatedCost = estimateParkingCost(bestSpot.prices, parkingDurationHours);

        // 4. Build Timeline Steps
        if (index > 0) {
            const previousEvent = sortedEvents[index - 1];
            timeline.push({
                time: leavePrevious,
                title: "Walk to Car",
                description: `Return to ${previousLocation.name}.`,
                type: "walk",
                difficulty: "Intermediate",
                mapLink: getDirectionsLink({ lat: previousEvent.lat, lng: previousEvent.lng }, { lat: previousLocation.lat, lng: previousLocation.lng }, "walking"),
            });
        }

        timeline.push({
            time: leavePrevious,
            title: index === 0 ? "Leave Home" : `Drive to ${bestSpot.name}`,
            description: `Drive ~${(driveTimeSec / 60).toFixed(0)} mins.`,
            type: "drive",
            difficulty: "Beginner",
            mapLink: getDirectionsLink(previousLocation, { lat: bestSpot.latitude, lng: bestSpot.longitude }, "driving"),
        });

        timeline.push({
            time: arriveAtPark,
            title: `Park at ${bestSpot.name}`,
            description: `${bestSpot.prices}`,
            type: "park",
            difficulty: "Intermediate",
            mapLink: getLocationLink(bestSpot.latitude, bestSpot.longitude),
            cost: estimatedCost,
        });

        // If relocation happens, we need to account for split costs technically,
        // but for now we just warn.
        // If we find a backup spot, we could add the backup spot's cost too.
        if (parkingDurationHours > maxFree) {
            const moveTime = new Date(arriveAtPark.getTime() + maxFree * 3600000 - 15 * 60000);

            const secondarySpots = (parkingData as ParkingLocation[]).filter((p) => p.name !== bestSpot.name && isParkingOpen(p, moveTime) && getDistanceFromLatLonInM(p.latitude, p.longitude, event.lat, event.lng) <= maxRadiusMeters);

            const backupSpot = secondarySpots.length > 0 ? secondarySpots[0] : null;

            if (backupSpot) {
                timeline.push({
                    time: moveTime,
                    title: "⚠️ Move Car",
                    description: `Limit (${maxFree}h) expiring. Move to ${backupSpot.name}.`,
                    type: "relocate",
                    difficulty: "Advanced",
                    mapLink: getDirectionsLink({ lat: bestSpot.latitude, lng: bestSpot.longitude }, { lat: backupSpot.latitude, lng: backupSpot.longitude }, "driving"),
                });
                timeline.push({
                    time: new Date(moveTime.getTime() + 15 * 60000),
                    title: `Repark at ${backupSpot.name}`,
                    description: `${backupSpot.prices}`,
                    type: "park",
                    difficulty: "Intermediate",
                    mapLink: getLocationLink(backupSpot.latitude, backupSpot.longitude),
                    // Add remaining time cost, treating the move as a new parking session
                    cost: estimateParkingCost(backupSpot.prices, parkingDurationHours - maxFree),
                });
            } else {
                timeline.push({
                    time: moveTime,
                    title: "⚠️ Limit Reached",
                    description: `Limit (${maxFree}h) expiring. No backup spot found.`,
                    type: "relocate",
                    difficulty: "Advanced",
                    mapLink: getDirectionsLink({ lat: event.lat, lng: event.lng }, { lat: bestSpot.latitude, lng: bestSpot.longitude }, "walking"),
                });
            }
        }

        timeline.push({
            time: arrivalAtEvent,
            title: `Arrive at ${event.title}`,
            description: `Walked ~${(walkTimeSec / 60).toFixed(0)} mins.`,
            type: "event",
            difficulty: "Beginner",
            mapLink: getDirectionsLink({ lat: bestSpot.latitude, lng: bestSpot.longitude }, { lat: event.lat, lng: event.lng }, "walking"),
        });

        previousLocation = { lat: bestSpot.latitude, lng: bestSpot.longitude, name: bestSpot.name };
    });

    return timeline;
}
