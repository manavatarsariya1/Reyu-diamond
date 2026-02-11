import type { DiamondPreference } from "@/types/preference";
import { DiamondPreferenceCard } from "./DiamondPreferenceCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface PreferenceListProps {
    preferences: DiamondPreference[];
    onDelete: (id: string) => void;
}

export function PreferenceList({ preferences, onDelete }: PreferenceListProps) {
    if (preferences.length === 0) {
        return (
            <div className="text-center py-20 bg-muted/20 rounded-lg border-2 border-dashed">
                <h3 className="text-lg font-semibold mb-2">No Preferences Saved</h3>
                <p className="text-muted-foreground mb-6">Create a new preference to start tracking your favorite diamond criteria.</p>
                <Button asChild>
                    <Link to="/preferences/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Preference
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Your Preferences</h2>
                <Button asChild>
                    <Link to="/preferences/create">
                        <Plus className="mr-2 h-4 w-4" />
                        New Preference
                    </Link>
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {preferences.map((pref) => (
                    <DiamondPreferenceCard
                        key={pref.id}
                        preference={pref}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </div>
    );
}
