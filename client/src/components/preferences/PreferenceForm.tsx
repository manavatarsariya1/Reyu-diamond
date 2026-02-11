import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DiamondShape, DiamondColor, DiamondClarity, DiamondCertification } from "@/types/preference";
import type { DiamondPreference } from "@/types/preference";
import { toast } from "sonner";
import { preferenceSchema } from "@/validation/preferenceSchema";
import { ChevronDown, Check } from "lucide-react";

type PreferenceFormValues = z.infer<typeof preferenceSchema>;

interface PreferenceFormProps {
    initialData?: DiamondPreference;
    onSubmit: (data: PreferenceFormValues) => void;
    onCancel: () => void;
}

export function PreferenceForm({ initialData, onSubmit, onCancel }: PreferenceFormProps) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<PreferenceFormValues>({
        resolver: zodResolver(preferenceSchema),
        defaultValues: initialData ? {
            name: initialData.name,
            shapes: initialData.shapes,
            minCarat: initialData.minCarat,
            maxCarat: initialData.maxCarat,
            colors: initialData.colors,
            clarities: initialData.clarities,
            certifications: initialData.certifications,
            minBudget: initialData.minBudget,
            maxBudget: initialData.maxBudget,
        } : {
            name: "",
            shapes: [],
            minCarat: 0.5,
            maxCarat: 2.0,
            colors: [],
            clarities: [],
            certifications: [],
            minBudget: 1000,
            maxBudget: 10000,
        },
    });

    const watchedShapes = watch("shapes");
    const watchedColors = watch("colors");
    const watchedClarities = watch("clarities");
    const watchedCertifications = watch("certifications");

    const onFormSubmit = (data: PreferenceFormValues) => {
        onSubmit(data);
        toast.success("Preference saved successfully");
    };

    const toggleSelection = (field: keyof PreferenceFormValues, value: string, currentValues: string[]) => {
        const newValues = currentValues.includes(value)
            ? currentValues.filter((v) => v !== value)
            : [...currentValues, value];
        setValue(field as any, newValues, { shouldValidate: true });
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">

                {/* Header */}
                <div className="px-8 py-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                    <h2 className="text-2xl font-bold tracking-tight">
                        {initialData ? "Refine Your Criteria" : "Design Your Dream Diamond"}
                    </h2>
                    <p className="text-blue-200 mt-1 text-sm">
                        Specify your exact requirements and we'll help you find the perfect match.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onFormSubmit)} className="p-8 space-y-8">

                    {/* Preference Name */}
                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                            Preference Name
                        </label>
                        <input
                            id="name"
                            {...register("name")}
                            placeholder="e.g. Engagement Ring Options"
                            className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'} transition-all outline-none text-gray-800 placeholder:text-gray-400`}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-xs mt-1 font-medium">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Carat Range */}
                        <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                                Carat Weight
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Min</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register("minCarat")}
                                            className="w-full pl-3 pr-8 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                        />
                                        <span className="absolute right-3 top-2 text-gray-400 text-sm">ct</span>
                                    </div>
                                </div>
                                <div className="text-gray-300 font-light text-2xl pt-5">-</div>
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Max</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register("maxCarat")}
                                            className="w-full pl-3 pr-8 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                        />
                                        <span className="absolute right-3 top-2 text-gray-400 text-sm">ct</span>
                                    </div>
                                </div>
                            </div>
                            {errors.minCarat && <p className="text-red-500 text-xs">{errors.minCarat.message}</p>}
                            {errors.maxCarat && <p className="text-red-500 text-xs">{errors.maxCarat.message}</p>}
                        </div>

                        {/* Budget Range */}
                        <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                                Budget
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Min</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500 font-medium">$</span>
                                        <input
                                            type="number"
                                            step="100"
                                            {...register("minBudget")}
                                            className="w-full pl-7 pr-4 py-2 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="text-gray-300 font-light text-2xl pt-5">-</div>
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Max</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500 font-medium">$</span>
                                        <input
                                            type="number"
                                            step="100"
                                            {...register("maxBudget")}
                                            className="w-full pl-7 pr-4 py-2 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                            {errors.minBudget && <p className="text-red-500 text-xs">{errors.minBudget.message}</p>}
                            {errors.maxBudget && <p className="text-red-500 text-xs">{errors.maxBudget.message}</p>}
                        </div>
                    </div>

                    {/* Shapes Selection */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">Diamond Shape</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                            {Object.values(DiamondShape).map((shape) => {
                                const isSelected = watchedShapes.includes(shape);
                                return (
                                    <button
                                        key={shape}
                                        type="button"
                                        onClick={() => toggleSelection("shapes", shape, watchedShapes)}
                                        className={`
                                            relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200
                                            ${isSelected
                                                ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm ring-1 ring-blue-500'
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        <span className="text-sm font-medium">{shape}</span>
                                        {isSelected && (
                                            <div className="absolute top-2 right-2">
                                                <Check className="w-4 h-4 text-blue-500" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {errors.shapes && <p className="text-red-500 text-xs">{errors.shapes.message}</p>}
                    </div>

                    {/* Colors Selection */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">Color Grade</label>
                        <div className="flex flex-wrap gap-2">
                            {Object.values(DiamondColor).map((color) => {
                                const isSelected = watchedColors.includes(color);
                                return (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => toggleSelection("colors", color, watchedColors)}
                                        className={`
                                            w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all border
                                            ${isSelected
                                                ? 'bg-gray-900 border-gray-900 text-white shadow-md transform scale-105'
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        {color}
                                    </button>
                                );
                            })}
                        </div>
                        {errors.colors && <p className="text-red-500 text-xs">{errors.colors.message}</p>}
                    </div>

                    {/* Clarity Selection */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">Clarity</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            {Object.values(DiamondClarity).map((clarity) => {
                                const isSelected = watchedClarities.includes(clarity);
                                return (
                                    <button
                                        key={clarity}
                                        type="button"
                                        onClick={() => toggleSelection("clarities", clarity, watchedClarities)}
                                        className={`
                                            px-3 py-2 rounded-lg text-sm font-medium transition-all border
                                            ${isSelected
                                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        {clarity}
                                    </button>
                                );
                            })}
                        </div>
                        {errors.clarities && <p className="text-red-500 text-xs">{errors.clarities.message}</p>}
                    </div>

                    {/* Certification Selection */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">Certification</label>
                        <div className="flex flex-wrap gap-3">
                            {Object.values(DiamondCertification).map((cert) => {
                                const isSelected = watchedCertifications.includes(cert);
                                return (
                                    <button
                                        key={cert}
                                        type="button"
                                        onClick={() => toggleSelection("certifications", cert, watchedCertifications)}
                                        className={`
                                            px-4 py-2 rounded-full text-sm font-semibold transition-all border
                                            ${isSelected
                                                ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        {cert}
                                    </button>
                                );
                            })}
                        </div>
                        {errors.certifications && <p className="text-red-500 text-xs">{errors.certifications.message}</p>}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 transform hover:-translate-y-0.5 transition-all"
                        >
                            {initialData ? "Update Preference" : "Save Preference"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
