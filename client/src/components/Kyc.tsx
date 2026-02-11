import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { kycSchema } from "@/validation/kycSchema";
import Webcam from "react-webcam";
import { useRef, useState } from "react";





// const kycSchema = z.object({
//   aadhaarNumber: z
//     .string()
//     .regex(/^[0-9]{12}$/, "Aadhaar must be 12 digits"),

//   panNumber: z
//     .string()
//     .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"),

//   aadhaarImage: z
//     .instanceof(FileList)
//     .refine((files) => files.length === 1, "Aadhaar image required"),

//   panImage: z
//     .instanceof(FileList)
//     .refine((files) => files.length === 1, "PAN image required"),

//   selfie: z
//     .instanceof(FileList)
//     .refine((files) => files.length === 1, "Selfie required"),
// });

type KycFormData = z.infer<typeof kycSchema>;

const Kyc: React.FC = () => {
    const webcamRef = useRef<Webcam>(null);
    const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

    //   const {
    //     register,
    //     handleSubmit,
    //     watch,
    //     formState: { errors },
    //   } = useForm<KycFormData>({
    //     resolver: zodResolver(kycSchema),
    //   });
    
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<KycFormData>({
        resolver: zodResolver(kycSchema),
    });

    const captureSelfie = () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc) return;

        setSelfiePreview(imageSrc);

        // convert base64 → File
        fetch(imageSrc)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);

                setValue("selfie", dataTransfer.files, { shouldValidate: true });
            });
    };



    const onSubmit = (data: KycFormData) => {
        console.log("KYC Data:", data);
    };

    const aadhaarImage = watch("aadhaarImage");
    const panImage = watch("panImage");
    const selfie = watch("selfie");

    const renderPreview = (file?: FileList) => {
        if (file && file.length > 0) {
            return (
                <img
                    src={URL.createObjectURL(file[0])}
                    alt="preview"
                    className="w-28 mt-2 rounded-lg border"
                />
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    KYC Verification
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                    {/* Aadhaar */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Aadhaar Number
                        </label>
                        <input
                            type="text"
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
                            {...register("aadhaarNumber")}
                        />
                        {errors.aadhaarNumber && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.aadhaarNumber.message}
                            </p>
                        )}
                    </div>

                    {/* PAN */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            PAN Number
                        </label>
                        <input
                            type="text"
                            className="w-full border rounded-lg px-3 py-2 uppercase focus:ring-2 focus:ring-black"
                            {...register("panNumber")}
                        />
                        {errors.panNumber && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.panNumber.message}
                            </p>
                        )}
                    </div>

                    {/* Aadhaar Upload */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Upload Aadhaar Photo
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            className="w-full border rounded-lg p-2"
                            {...register("aadhaarImage")}
                        />
                        {renderPreview(aadhaarImage)}
                        {errors.aadhaarImage && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.aadhaarImage.message}
                            </p>
                        )}
                    </div>

                    {/* PAN Upload */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Upload PAN Photo
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            className="w-full border rounded-lg p-2"
                            {...register("panImage")}
                        />
                        {renderPreview(panImage)}
                        {errors.panImage && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.panImage.message}
                            </p>
                        )}
                    </div>

                    {/* Selfie */}
                    <div>
                        {/* Live Selfie */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Capture Selfie
                            </label>

                            {!selfiePreview ? (
                                <>
                                    <Webcam
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        className="rounded-lg w-60"
                                        videoConstraints={{ facingMode: "user" }}
                                    />
                                    <button
                                        type="button"
                                        onClick={captureSelfie}
                                        className="mt-2 bg-black text-white px-4 py-2 rounded-lg"
                                    >
                                        Capture
                                    </button>
                                </>
                            ) : (
                                <>
                                    <img
                                        src={selfiePreview}
                                        alt="selfie"
                                        className="w-60 rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setSelfiePreview(null)}
                                        className="mt-2 bg-gray-600 text-white px-4 py-2 rounded-lg"
                                    >
                                        Retake
                                    </button>
                                </>
                            )}

                            {errors.selfie && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.selfie.message}
                                </p>
                            )}
                        </div>

                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
                    >
                        Submit KYC
                    </button>

                </form>
            </div>
        </div>
    );
};

export default Kyc;
