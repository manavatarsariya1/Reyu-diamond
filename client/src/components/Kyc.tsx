import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Webcam from "react-webcam";
import { kycSchema } from "@/validation/kycSchema";
import { submitKycRequested } from "@/features/kyc/kycSlice";
import { useDispatch } from "react-redux";

// Zod validation schema matching backend model
// const kycSchema = z.object({
//   // Personal Information
//   firstName: z
//     .string()
//     .min(1, "First name is required")
//     .max(50, "First name must not exceed 50 characters")
//     .trim(),

//   middleName: z
//     .string()
//     .max(50, "Middle name must not exceed 50 characters")
//     .trim()
//     .optional()
//     .or(z.literal("")),

//   lastName: z
//     .string()
//     .min(1, "Last name is required")
//     .max(50, "Last name must not exceed 50 characters")
//     .trim(),

//   dob: z
//     .string()
//     .min(1, "Date of birth is required")
//     .refine((date) => {
//       const birthDate = new Date(date);
//       const today = new Date();
//       const age = today.getFullYear() - birthDate.getFullYear();
//       return age >= 18;
//     }, "You must be at least 18 years old"),

//   phone: z
//     .string()
//     .regex(/^[6-9]\d{9}$/, "Phone number must be 10 digits starting with 6-9"),

//   // Address
//   residentialAddress: z
//     .string()
//     .min(1, "Residential address is required")
//     .trim(),

//   city: z
//     .string()
//     .min(1, "City is required")
//     .trim(),

//   state: z
//     .string()
//     .min(1, "State is required")
//     .trim(),

//   pincode: z
//     .string()
//     .regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),

//   country: z
//     .string()
//     .default("IN")
//     .optional(),

//   // Documents
//   aadhaarNumber: z
//     .string()
//     .regex(/^[0-9]{12}$/, "Aadhaar must be exactly 12 digits"),

//   panNumber: z
//     .string()
//     .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format (e.g., ABCDE1234F)")
//     .transform((val) => val.toUpperCase()),

//   aadhaarImage: z
//     .instanceof(FileList)
//     .refine((files) => files.length === 1, "Aadhaar image is required")
//     .refine(
//       (files) => files[0]?.size <= 5000000,
//       "Image size must be less than 5MB"
//     )
//     .refine(
//       (files) => ["image/jpeg", "image/jpg", "image/png"].includes(files[0]?.type),
//       "Only JPG, JPEG, and PNG formats are allowed"
//     ),

//   panImage: z
//     .instanceof(FileList)
//     .refine((files) => files.length === 1, "PAN image is required")
//     .refine(
//       (files) => files[0]?.size <= 5000000,
//       "Image size must be less than 5MB"
//     )
//     .refine(
//       (files) => ["image/jpeg", "image/jpg", "image/png"].includes(files[0]?.type),
//       "Only JPG, JPEG, and PNG formats are allowed"
//     ),

//   selfie: z
//     .instanceof(FileList)
//     .refine((files) => files.length === 1, "Selfie is required")
//     .refine(
//       (files) => files[0]?.size <= 5000000,
//       "Image size must be less than 5MB"
//     ),
// });

type KycFormData = z.infer<typeof kycSchema>;

const Kyc: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<KycFormData>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      country: "IN",
    },
  });

  const captureSelfie = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    setSelfiePreview(imageSrc);

    // Convert base64 to File
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);

        setValue("selfie", dataTransfer.files, { shouldValidate: true });
      });
  };

  const onSubmit = (data: KycFormData) => {
      console.log("hi")
      console.log("KYC Data:", data);
    dispatch(submitKycRequested(data));
    // Here you would typically send the data to your backend
    // const formData = new FormData();
    // Object.entries(data).forEach(([key, value]) => {
    //   if (value instanceof FileList) {
    //     formData.append(key, value[0]);
    //   } else {
    //     formData.append(key, value);
    //   }
    // });
  };

  const aadhaarImage = watch("aadhaarImage");
  const panImage = watch("panImage");

  const renderPreview = (file?: FileList) => {
    if (file && file.length > 0) {
      return (
        <img
          src={URL.createObjectURL(file[0])}
          alt="preview"
          className="w-32 h-32 mt-2 rounded-lg border object-cover"
        />
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              KYC Verification
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please provide accurate information for identity verification
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    {...register("firstName")}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                {/* Middle Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    {...register("middleName")}
                  />
                  {errors.middleName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.middleName.message}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    {...register("lastName")}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    {...register("dob")}
                  />
                  {errors.dob && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.dob.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Address Details
              </h3>

              {/* Residential Address */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Residential Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  {...register("residentialAddress")}
                />
                {errors.residentialAddress && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.residentialAddress.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    {...register("city")}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    {...register("state")}
                  />
                  {errors.state && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.state.message}
                    </p>
                  )}
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    {...register("pincode")}
                  />
                  {errors.pincode && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.pincode.message}
                    </p>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    {...register("country")}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Document Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Identity Documents
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Aadhaar Section */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aadhaar Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="123456789012"
                      maxLength={12}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      {...register("aadhaarNumber")}
                    />
                    {errors.aadhaarNumber && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.aadhaarNumber.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Aadhaar Card <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      {...register("aadhaarImage")}
                    />
                    {renderPreview(aadhaarImage)}
                    {errors.aadhaarImage && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.aadhaarImage.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* PAN Section */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PAN Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 uppercase focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      {...register("panNumber")}
                    />
                    {errors.panNumber && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.panNumber.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload PAN Card <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      {...register("panImage")}
                    />
                    {renderPreview(panImage)}
                    {errors.panImage && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.panImage.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Selfie Verification Section */}
            <div className="pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Selfie Verification
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capture Live Selfie 
                  {/* <span className="text-red-500">*</span> */}
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Please ensure your face is clearly visible and well-lit
                </p>

                <div className="flex flex-col items-center">
                  {!selfiePreview ? (
                    <div className="space-y-3">
                      <Webcam
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="rounded-lg border-2 border-gray-300 w-full max-w-md"
                        videoConstraints={{ facingMode: "user" }}
                      />
                      <button
                        type="button"
                        onClick={captureSelfie}
                        className="w-full bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
                      >
                        📸 Capture Selfie
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <img
                        src={selfiePreview}
                        alt="selfie preview"
                        className="rounded-lg border-2 border-green-300 w-full max-w-md"
                      />
                      <button
                        type="button"
                        onClick={() => setSelfiePreview(null)}
                        className="w-full bg-gray-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-700 transition"
                      >
                        🔄 Retake Selfie
                      </button>
                    </div>
                  )}

                  {/* {errors.selfie && (
                    <p className="text-red-500 text-xs mt-2">
                      {errors.selfie.message}
                    </p>
                  )} */}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Submit KYC Application
              </button>
              <p className="text-xs text-gray-500 text-center mt-3">
                By submitting, you confirm that all information provided is accurate and true
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Kyc;