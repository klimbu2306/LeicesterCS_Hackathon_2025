import { useEffect } from "react";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";

interface PlacesAutocompleteProps {
    onSelect: (address: string, lat: number, lng: number) => void;
    initialValue?: string; // <--- NEW PROP to load saved address
}

export default function PlacesAutocomplete({ onSelect, initialValue }: PlacesAutocompleteProps) {
    const {
        ready,
        value,
        setValue,
        suggestions: { status, data },
        clearSuggestions,
    } = usePlacesAutocomplete({
        debounce: 300,
    });

    // NEW: Sync the input box with the saved address on load
    useEffect(() => {
        if (initialValue) {
            setValue(initialValue, false); // false means "don't fetch suggestions for this"
        }
    }, [initialValue, setValue]);

    const handleSelect = async (address: string) => {
        // 1. Update input value immediately
        setValue(address, false);
        clearSuggestions();

        try {
            const results = await getGeocode({ address });
            const { lat, lng } = await getLatLng(results[0]);
            // 2. Pass data back to parent
            onSelect(address, lat, lng);
        } catch (error) {
            console.error("Error: ", error);
        }
    };

    return (
        <div className="relative w-full z-[101]">
            <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={!ready}
                className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#0a0a0a] dark:border-neutral-800 dark:text-[#ededed] dark:placeholder-neutral-500 transition-colors"
                placeholder="Search address..."
            />
            {status === "OK" && (
                <ul className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl dark:bg-[#0a0a0a] dark:border-neutral-800 overflow-hidden z-50">
                    {data.map(({ place_id, description }) => (
                        <li key={place_id} onClick={() => handleSelect(description)} className="cursor-pointer p-3 hover:bg-gray-100 dark:hover:bg-neutral-900 dark:text-[#ededed] border-b border-gray-100 dark:border-neutral-800 last:border-none">
                            {description}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
