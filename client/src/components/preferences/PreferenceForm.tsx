import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DiamondShape, DiamondColor, DiamondClarity, DiamondCertification } from "@/types/preference";
import type { DiamondPreference } from "@/types/preference";
import { toast } from "sonner";
import { preferenceSchema } from "@/validation/preferenceSchema";
import { Check } from "lucide-react";

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
            shape: initialData.shape,
            carat: initialData.carat,
            color: initialData.color,
            clarity: initialData.clarity,
            lab: initialData.lab,
            location: initialData.location,
            budget: initialData.budget,
        } : {
            shape: undefined,
            carat: 1.0,
            color: undefined,
            clarity: undefined,
            lab: undefined,
            location: "",
            budget: 5000,
        },
    });

    const watchedShape = watch("shape");
    const watchedColor = watch("color");
    const watchedClarity = watch("clarity");
    const watchedLab = watch("lab");

    const onFormSubmit = (data: PreferenceFormValues) => {
        onSubmit(data);
        toast.success("Preference saved successfully");
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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Carat */}
                        <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                                Carat Weight
                            </h3>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register("carat")}
                                    className="w-full pl-3 pr-8 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                />
                                <span className="absolute right-3 top-2 text-gray-400 text-sm">ct</span>
                            </div>
                            {errors.carat && <p className="text-red-500 text-xs">{errors.carat.message}</p>}
                        </div>

                        {/* Budget */}
                        <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                                Budget
                            </h3>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500 font-medium">$</span>
                                <input
                                    type="number"
                                    step="100"
                                    {...register("budget")}
                                    className="w-full pl-7 pr-4 py-2 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all"
                                />
                            </div>
                            {errors.budget && <p className="text-red-500 text-xs">{errors.budget.message}</p>}
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Location</label>
                        <input
                            {...register("location")}
                            placeholder="e.g. New York, USA"
                            className={`w-full px-4 py-3 rounded-xl border ${errors.location ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'} transition-all outline-none text-gray-800 placeholder:text-gray-400`}
                        />
                        {errors.location && <p className="text-red-500 text-xs mt-1 font-medium">{errors.location.message}</p>}
                    </div>

                    {/* Shape - single select */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">Diamond Shape</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                            {Object.values(DiamondShape).map((shape) => (
                                <button
                                    key={shape}
                                    type="button"
                                    onClick={() => setValue("shape", shape, { shouldValidate: true })}
                                    className={`relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200
                                        ${watchedShape === shape
                                            ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm ring-1 ring-blue-500'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="text-sm font-medium">{shape}</span>
                                    {watchedShape === shape && (
                                        <div className="absolute top-2 right-2">
                                            <Check className="w-4 h-4 text-blue-500" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        {errors.shape && <p className="text-red-500 text-xs">{errors.shape.message}</p>}
                    </div>

                    {/* Color - single select */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">Color Grade</label>
                        <div className="flex flex-wrap gap-2">
                            {Object.values(DiamondColor).map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setValue("color", color, { shouldValidate: true })}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all border
                                        ${watchedColor === color
                                            ? 'bg-gray-900 border-gray-900 text-white shadow-md scale-105'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {color}
                                </button>
                            ))}
                        </div>
                        {errors.color && <p className="text-red-500 text-xs">{errors.color.message}</p>}
                    </div>

                    {/* Clarity - single select */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">Clarity</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            {Object.values(DiamondClarity).map((clarity) => (
                                <button
                                    key={clarity}
                                    type="button"
                                    onClick={() => setValue("clarity", clarity, { shouldValidate: true })}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border
                                        ${watchedClarity === clarity
                                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {clarity}
                                </button>
                            ))}
                        </div>
                        {errors.clarity && <p className="text-red-500 text-xs">{errors.clarity.message}</p>}
                    </div>

                    {/* Lab/Certification - single select */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">Certification</label>
                        <div className="flex flex-wrap gap-3">
                            {Object.values(DiamondCertification).map((cert) => (
                                <button
                                    key={cert}
                                    type="button"
                                    onClick={() => setValue("lab", cert, { shouldValidate: true })}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border
                                        ${watchedLab === cert
                                            ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {cert}
                                </button>
                            ))}
                        </div>
                        {errors.lab && <p className="text-red-500 text-xs">{errors.lab.message}</p>}
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