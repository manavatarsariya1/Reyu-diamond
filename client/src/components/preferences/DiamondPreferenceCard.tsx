import type { DiamondPreference } from "@/types/preference";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, ArrowRight, Diamond, DollarSign, Scale, Hexagon, Palette, Eye, Award, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

interface DiamondPreferenceCardProps {
    preference: DiamondPreference;
    onDelete: (id: string) => void;
}

export function DiamondPreferenceCard({ preference, onDelete }: DiamondPreferenceCardProps) {
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

    return (
        <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
            {/* Top Gradient Accent */}
            <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            <div className="p-6 flex-grow flex flex-col gap-5">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-xs font-medium text-indigo-500 uppercase tracking-wider mb-1">
                            Saved Requirement
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight capitalize">
                            {preference.shape} Diamond
                        </h3>
                        <div className="flex items-center gap-1 mt-1 text-gray-400 text-xs">
                            <MapPin className="w-3 h-3" />
                            <span>{preference.location}</span>
                        </div>
                    </div>
                    <div className="p-2 bg-indigo-50 rounded-full text-indigo-600">
                        <Diamond className="w-5 h-5" />
                    </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Carat */}
                    <div className="bg-blue-50 rounded-xl p-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-blue-500 text-xs font-semibold uppercase tracking-wide">
                            <Scale className="w-3.5 h-3.5" />
                            <span>Carat</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                            {preference.carat}
                            <span className="text-xs font-normal text-gray-400 ml-1">ct</span>
                        </div>
                    </div>

                    {/* Budget */}
                    <div className="bg-green-50 rounded-xl p-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-green-600 text-xs font-semibold uppercase tracking-wide">
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Budget</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                            {formatCurrency(preference.budget)}
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Details Row */}
                <div className="grid grid-cols-3 gap-3">
                    {/* Color */}
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1 text-gray-400 text-xs font-medium uppercase tracking-wide">
                            <Palette className="w-3 h-3" />
                            <span>Color</span>
                        </div>
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-white text-gray-800 text-sm font-bold rounded-full border-2 border-gray-200 shadow-sm">
                            {preference.color}
                        </span>
                    </div>

                    {/* Clarity */}
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1 text-gray-400 text-xs font-medium uppercase tracking-wide">
                            <Eye className="w-3 h-3" />
                            <span>Clarity</span>
                        </div>
                        <span className="inline-flex px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                            {preference.clarity}
                        </span>
                    </div>

                    {/* Lab */}
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1 text-gray-400 text-xs font-medium uppercase tracking-wide">
                            <Award className="w-3 h-3" />
                            <span>Lab</span>
                        </div>
                        <span className="inline-flex px-2 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-lg border border-amber-100">
                            {preference.lab}
                        </span>
                    </div>
                </div>

                {/* Created At */}
                <div className="text-xs text-gray-400 mt-auto">
                    Added {new Date(preference.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8 px-3 text-xs bg-white text-gray-600 border-gray-200 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                    >
                        <Link to={`/preferences/edit/${preference._id}`}>
                            <Edit2 className="w-3 h-3 mr-1.5" />
                            Edit
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(preference._id)}
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