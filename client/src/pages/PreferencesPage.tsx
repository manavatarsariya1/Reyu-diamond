import { useState, useEffect } from "react";
import type { DiamondPreference } from "@/types/preference";
import { PreferenceList } from "@/components/preferences/PreferenceList";
import { toast } from "sonner";

export default function PreferencesPage() {
    const [preferences, setPreferences] = useState<DiamondPreference[]>([]);

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem("diamond_preferences");
        if (saved) {
            try {
                setPreferences(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse preferences", e);
            }
        }
    }, []);

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this preference?")) {
            const updatedPreferences = preferences.filter((p) => p.id !== id);
            setPreferences(updatedPreferences);
            localStorage.setItem("diamond_preferences", JSON.stringify(updatedPreferences));
            toast.success("Preference deleted");
        }
    };

    return (
        <div className="container mx-auto py-6">
            <PreferenceList
                preferences={preferences}
                onDelete={handleDelete}
            />
        </div>
    );
}
