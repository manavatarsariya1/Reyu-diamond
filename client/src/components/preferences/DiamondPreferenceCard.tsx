import type { DiamondPreference } from "@/types/preference";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, ArrowRight, Diamond, DollarSign, Scale, Hexagon, Palette, Eye, Award } from "lucide-react";
import { Link } from "react-router-dom";

interface DiamondPreferenceCardProps {
    preference: DiamondPreference;
    onDelete: (id: string) => void;
}

export function DiamondPreferenceCard({ preference, onDelete }: DiamondPreferenceCardProps) {
    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
            {/* Top Gradient Accent */}
            <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            <div className="p-6 flex-grow flex flex-col gap-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-xs font-medium text-indigo-500 uppercase tracking-wider mb-1">
                            Saved Preference
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">
                            {preference.name || "Untitled Preference"}
                        </h3>
                    </div>
                    <div className="p-2 bg-indigo-50 rounded-full text-indigo-600">
                        <Diamond className="w-5 h-5" />
                    </div>
                </div>

                {/* Body Content */}
                <div className="space-y-5">
                    {/* Carat & Budget Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
                                <Scale className="w-3.5 h-3.5" />
                                <span>Carat</span>
                            </div>
                            <div className="text-sm font-bold text-gray-900">
                                {preference.minCarat} ct – {preference.maxCarat} ct
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>Budget</span>
                            </div>
                            <div className="text-sm font-bold text-gray-900">
                                {formatCurrency(preference.minBudget)} – {formatCurrency(preference.maxBudget)}
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100" />

                    {/* Shapes */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
                            <Hexagon className="w-3.5 h-3.5" />
                            <span>Shapes</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {preference.shapes && preference.shapes.length > 0 ? (
                                preference.shapes.map((shape) => (
                                    <span
                                        key={shape}
                                        className="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-semibold rounded-full border border-gray-200"
                                    >
                                        {shape}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-gray-400 italic">Any Shape</span>
                            )}
                        </div>
                    </div>

                    {/* Colors & Clarity */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
                                <Palette className="w-3.5 h-3.5" />
                                <span>Color</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {preference.colors && preference.colors.length > 0 ? (
                                    preference.colors.map((color) => (
                                        <span
                                            key={color}
                                            className="w-6 h-6 flex items-center justify-center bg-white text-gray-700 text-xs font-bold rounded-full border border-gray-200 shadow-sm"
                                        >
                                            {color}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-gray-400 italic">Any</span>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
                                <Eye className="w-3.5 h-3.5" />
                                <span>Clarity</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {preference.clarities && preference.clarities.length > 0 ? (
                                    preference.clarities.map((clarity) => (
                                        <span
                                            key={clarity}
                                            className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded shadow-sm border border-indigo-100"
                                        >
                                            {clarity}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-gray-400 italic">Any</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Certification */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
                            <Award className="w-3.5 h-3.5" />
                            <span>Certification</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {preference.certifications && preference.certifications.length > 0 ? (
                                preference.certifications.map((cert) => (
                                    <span
                                        key={cert}
                                        className="px-2.5 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-md border border-amber-100"
                                    >
                                        {cert}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-gray-400 italic">Any</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8 px-3 text-xs bg-white text-gray-600 border-gray-200 hover:bg-white hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                    >
                        <Link to={`/preferences/edit/${preference.id}`}>
                            <Edit2 className="w-3 h-3 mr-1.5" />
                            Edit
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(preference.id)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>

                <Button
                    className="h-8 text-xs bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 text-white shadow-sm hover:shadow-md transition-all"
                    size="sm"
                >
                    View Matches
                    <ArrowRight className="w-3 h-3 ml-1.5" />
                </Button>
            </div>
        </div>
    );
}
