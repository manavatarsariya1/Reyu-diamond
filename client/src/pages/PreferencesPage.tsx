import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyRequirementsStart, deletePreferenceStart } from "@/features/preference/preferenceSlice";
import type { RootState } from "@/app/store";
import { PreferenceList } from "@/components/preferences/PreferenceList";

export default function PreferencesPage() {
    const dispatch = useDispatch();
    const { preferences, loading } = useSelector((state: RootState) => state.preference);

    useEffect(() => {
        dispatch(fetchMyRequirementsStart());
    }, [dispatch]);

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this preference?")) {
            dispatch(deletePreferenceStart(id));
        }
    };

    if (loading && preferences.length === 0) {
        return <div className="p-8 text-center text-muted-foreground italic">Loading your preferences...</div>;
    }

    return (
        <div className="container mx-auto py-6">
            <PreferenceList
                preferences={preferences}
                onDelete={handleDelete}
            />
        </div>
    );
}
