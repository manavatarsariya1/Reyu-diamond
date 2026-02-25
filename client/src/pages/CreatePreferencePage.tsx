import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { submitPreferenceStart } from "@/features/preference/preferenceSlice";
import { PreferenceForm } from "@/components/preferences/PreferenceForm";

export default function CreatePreferencePage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleCreate = (data: any) => {
        dispatch(submitPreferenceStart(data));
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
