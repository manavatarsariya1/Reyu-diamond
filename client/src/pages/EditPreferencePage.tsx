import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PreferenceForm } from "@/components/preferences/PreferenceForm";
import type { DiamondPreference } from "@/types/preference";
import { toast } from "sonner";

export default function EditPreferencePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [preference, setPreference] = useState<DiamondPreference | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const saved = localStorage.getItem("diamond_preferences");
        if (saved) {
            try {
                const preferences: DiamondPreference[] = JSON.parse(saved);
                const found = preferences.find(p => p.id === id);
                if (found) {
                    setPreference(found);
                } else {
                    toast.error("Preference not found");
                    navigate("/preferences");
                }
            } catch (e) {
                console.error("Failed to parse preferences", e);
                toast.error("Error loading preference");
            }
        }
        setLoading(false);
    }, [id, navigate]);

    const handleUpdate = (data: any) => {
        if (!preference) return;

        const saved = localStorage.getItem("diamond_preferences");
        const preferences: DiamondPreference[] = saved ? JSON.parse(saved) : [];

        const updatedPreferences = preferences.map(p =>
            p.id === preference.id ? { ...p, ...data } : p
        );

        localStorage.setItem("diamond_preferences", JSON.stringify(updatedPreferences));
        toast.success("Preference updated successfully");
        navigate("/preferences");
    };

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    if (!preference) {
        return null; // Should have redirected
    }

    return (
        <div className="container mx-auto py-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Edit Preference</h1>
                <p className="text-muted-foreground">Update your preference details.</p>
            </div>
            <PreferenceForm
                initialData={preference}
                onSubmit={handleUpdate}
                onCancel={() => navigate("/preferences")}
            />
        </div>
    );
}
