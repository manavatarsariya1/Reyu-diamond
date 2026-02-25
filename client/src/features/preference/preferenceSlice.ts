import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DiamondPreference } from "@/types/preference";
import type { SubmitPreferencePayload } from "@/api/preferenceService";

interface PreferenceState {
    preferences: DiamondPreference[];
    loading: boolean;
    error: string | null;
    currentPreference: DiamondPreference | null;
}

const initialState: PreferenceState = {
    preferences: [],
    loading: false,
    error: null,
    currentPreference: null,
};

const preferenceSlice = createSlice({
    name: "preference",
    initialState,
    reducers: {
        // Fetch Preferences
        fetchMyRequirementsStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchMyRequirementsSuccess: (state, action: PayloadAction<DiamondPreference[]>) => {
            state.loading = false;
            state.preferences = action.payload;
        },
        fetchMyRequirementsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Create Preference
        submitPreferenceStart: (state, _action: PayloadAction<SubmitPreferencePayload>) => {
            state.loading = true;
            state.error = null;
        },
        submitPreferenceSuccess: (state, action: PayloadAction<DiamondPreference>) => {
            state.loading = false;
            state.preferences.push(action.payload);
        },
        submitPreferenceFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Update Preference
        updatePreferenceStart: (state, _action: PayloadAction<{ id: string; payload: Partial<SubmitPreferencePayload> }>) => {
            state.loading = true;
            state.error = null;
        },
        updatePreferenceSuccess: (state, action: PayloadAction<DiamondPreference>) => {
            state.loading = false;
            const index = state.preferences.findIndex((p) => p._id === action.payload._id);
            if (index !== -1) {
                state.preferences[index] = action.payload;
            }
        },
        updatePreferenceFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Delete Preference
        deletePreferenceStart: (state, _action: PayloadAction<string>) => {
            state.loading = true;
            state.error = null;
        },
        deletePreferenceSuccess: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.preferences = state.preferences.filter((p) => p._id !== action.payload);
        },
        deletePreferenceFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Set Current Preference (for editing)
        setCurrentPreference: (state, action: PayloadAction<DiamondPreference | null>) => {
            state.currentPreference = action.payload;
        },
    },
});

export const {
    fetchMyRequirementsStart,
    fetchMyRequirementsSuccess,
    fetchMyRequirementsFailure,
    submitPreferenceStart,
    submitPreferenceSuccess,
    submitPreferenceFailure,
    updatePreferenceStart,
    updatePreferenceSuccess,
    updatePreferenceFailure,
    deletePreferenceStart,
    deletePreferenceSuccess,
    deletePreferenceFailure,
    setCurrentPreference,
} = preferenceSlice.actions;

export default preferenceSlice.reducer;
