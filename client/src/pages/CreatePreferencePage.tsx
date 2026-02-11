import { useNavigate } from "react-router-dom";
import { PreferenceForm } from "@/components/preferences/PreferenceForm";
import type { DiamondPreference } from "@/types/preference";
import { toast } from "sonner";

export default function CreatePreferencePage() {
    const navigate = useNavigate();

    const handleCreate = (data: any) => {
        const newPref: DiamondPreference = {
            ...data,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
        };

        const saved = localStorage.getItem("diamond_preferences");
        const preferences = saved ? JSON.parse(saved) : [];

        const updatedPreferences = [...preferences, newPref];
        localStorage.setItem("diamond_preferences", JSON.stringify(updatedPreferences));

        toast.success("Preference created successfully");
        navigate("/preferences");
    };

    return (
        <div className="container mx-auto py-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Create Preference</h1>
                <p className="text-muted-foreground">Set up your diamond search criteria.</p>
            </div>
            <PreferenceForm
                onSubmit={handleCreate}
                onCancel={() => navigate("/preferences")}
            />
        </div>
    );
}
