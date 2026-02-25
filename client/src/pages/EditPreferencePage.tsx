import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updatePreferenceStart } from "@/features/preference/preferenceSlice";
import type { RootState } from "@/app/store";
import { PreferenceForm } from "@/components/preferences/PreferenceForm";
import type { DiamondPreference } from "@/types/preference";
import { toast } from "sonner";

export default function EditPreferencePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { preferences, loading: reduxLoading } = useSelector((state: RootState) => state.preference);
    const [preference, setPreference] = useState<DiamondPreference | null>(null);

    useEffect(() => {
        if (!id) return;
        const found = preferences.find(p => p._id === id);
        if (found) {
            setPreference(found);
        } else if (!reduxLoading) {
            toast.error("Preference not found");
            navigate("/preferences");
        }
    }, [id, preferences, reduxLoading, navigate]);

    const handleUpdate = (data: any) => {
        if (!id) return;
        dispatch(updatePreferenceStart({ id, payload: data }));
        navigate("/preferences");
    };

    if (reduxLoading && !preference) {
        return <div className="p-8 text-center text-muted-foreground italic">Loading preference...</div>;
    }

    if (!preference) {
        return null;
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
