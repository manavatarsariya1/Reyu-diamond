import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Webcam from "react-webcam";
import { kycSchema } from "@/validation/kycSchema";
import { submitKycRequested, fetchKycStatusRequested } from "@/features/kyc/kycSlice";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { CheckCircle2, Clock, XCircle, ShieldCheck, RefreshCw } from "lucide-react";

type KycFormData = z.infer<typeof kycSchema>;

const Kyc: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const dispatch = useDispatch();

  const userId = useSelector((state: RootState) => state.auth.user?.id || (state.auth.user as any)?._id);
  const userName = useSelector((state: RootState) => state.auth.user?.username);
  const userEmail = useSelector((state: RootState) => state.auth.user?.email);
  const kycStatus = useSelector((state: RootState) => state.kyc?.fetchStatus?.kycStatus);
  const rejectionReason = useSelector((state: RootState) => state.kyc?.fetchStatus?.rejectionReason);
  const statusFetchLoading = useSelector((state: RootState) => state.kyc?.fetchStatus?.status === "loading");
  const submitStatus = useSelector((state: RootState) => state.kyc.submit.status);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<KycFormData>({
    resolver: zodResolver(kycSchema),
    defaultValues: { country: "IN" },
  });

  // Fetch status on mount
  useEffect(() => {
    if (userId) {
      dispatch(fetchKycStatusRequested(userId));
    }
  }, [userId, dispatch]);

  // Re-fetch after successful submit
  useEffect(() => {
    if (submitStatus === "success" && userId) {
      dispatch(fetchKycStatusRequested(userId));
    }
  }, [submitStatus, userId, dispatch]);

  // Live polling every 30 seconds
  useEffect(() => {
    if (!userId) return;
    if (kycStatus === "approved") return;

    const interval = setInterval(() => {
      dispatch(fetchKycStatusRequested(userId));
    }, 30000);

    return () => clearInterval(interval);
  }, [userId, kycStatus, dispatch]);

  const captureSelfie = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;
    setSelfiePreview(imageSrc);
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        // Cast to any to bypass strict literal check during transition
        setValue("selfie" as any, dataTransfer.files, { shouldValidate: true });
      });
  };

  const onSubmit = (data: KycFormData) => {
    dispatch(submitKycRequested(data as any));
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

  // ─── LOADING ──────────────────────────────────────────────────────
  if (statusFetchLoading && !kycStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white">
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-sm font-medium">Checking KYC status...</p>
        </div>
      </div>
    );
  }

  // ─── PENDING ──────────────────────────────────────────────────────
  if (kycStatus === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-amber-400 to-yellow-500" />
          <div className="p-8 flex flex-col items-center text-center gap-5">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-amber-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Under Review</h2>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                Your KYC documents have been submitted and are currently being reviewed. This usually takes 1–2 business days.
              </p>
            </div>
            <div className="w-full bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-amber-600 text-xs font-semibold uppercase tracking-widest">Status</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                <p className="text-amber-700 font-bold text-lg">Pending Approval</p>
              </div>
            </div>
            <button
              onClick={() => userId && dispatch(fetchKycStatusRequested(userId))}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition mt-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── APPROVED ─────────────────────────────────────────────────────
  if (kycStatus === "approved") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-green-400 to-emerald-500" />
          <div className="p-8 flex flex-col items-center text-center gap-5">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">KYC Verified ✓</h2>
              <p className="text-gray-500 text-sm mt-2">Your identity has been successfully verified.</p>
            </div>
            <div className="flex items-center gap-2 bg-green-50 border border-green-100 px-5 py-2.5 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-green-700 text-sm font-semibold">Verified Member</span>
            </div>
            <div className="w-full bg-gray-50 rounded-xl p-5 text-left space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Profile Info</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Full Name</p>
                  <p className="font-semibold text-gray-800 text-sm">{userName || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Email</p>
                  <p className="font-semibold text-gray-800 text-sm truncate">{userEmail || "—"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── NOT SUBMITTED + REJECTED (show form) ─────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Rejection Banner */}
        {kycStatus === "rejected" && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-red-400 to-rose-500" />
            <div className="p-6 flex gap-4 items-start">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900">KYC Rejected</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Your KYC was not approved. Please review the reason and resubmit with correct documents.
                </p>
                {rejectionReason && (
                  <div className="mt-3 bg-red-50 border border-red-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-1">Reason</p>
                    <p className="text-red-700 text-sm font-medium">{rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* KYC FORM */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">KYC Verification</h2>
            <p className="mt-2 text-sm text-gray-600">
              {kycStatus === "rejected"
                ? "Please resubmit your KYC with the correct information."
                : "Please provide accurate information for identity verification"}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Personal Information */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" {...register("firstName")} />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" {...register("middleName")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" {...register("lastName")} />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth <span className="text-red-500">*</span></label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" {...register("dob")} />
                  {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                  <input type="tel" placeholder="9876543210" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" {...register("phone")} />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Details</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Residential Address <span className="text-red-500">*</span></label>
                <textarea rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" {...register("residentialAddress")} />
                {errors.residentialAddress && <p className="text-red-500 text-xs mt-1">{errors.residentialAddress.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" {...register("city")} />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" {...register("state")} />
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="123456" maxLength={6} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" {...register("pincode")} />
                  {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50" {...register("country")} readOnly />
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Identity Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="123456789012" maxLength={12} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" {...register("aadhaarNumber")} />
                    {errors.aadhaarNumber && <p className="text-red-500 text-xs mt-1">{errors.aadhaarNumber.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Aadhaar Card <span className="text-red-500">*</span></label>
                    <input type="file" accept="image/jpeg,image/jpg,image/png" className="w-full border border-gray-300 rounded-lg p-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" {...register("aadhaarImage")} />
                    {renderPreview(aadhaarImage)}
                    {errors.aadhaarImage && <p className="text-red-500 text-xs mt-1">{errors.aadhaarImage.message}</p>}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="ABCDE1234F" maxLength={10} className="w-full border border-gray-300 rounded-lg px-3 py-2 uppercase focus:ring-2 focus:ring-blue-500 focus:border-transparent" {...register("panNumber")} />
                    {errors.panNumber && <p className="text-red-500 text-xs mt-1">{errors.panNumber.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload PAN Card <span className="text-red-500">*</span></label>
                    <input type="file" accept="image/jpeg,image/jpg,image/png" className="w-full border border-gray-300 rounded-lg p-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" {...register("panImage")} />
                    {renderPreview(panImage)}
                    {errors.panImage && <p className="text-red-500 text-xs mt-1">{errors.panImage.message}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Selfie */}
            <div className="pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Selfie Verification</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capture Live Selfie</label>
                <p className="text-xs text-gray-500 mb-3">Please ensure your face is clearly visible and well-lit</p>
                <div className="flex flex-col items-center">
                  {!selfiePreview ? (
                    <div className="space-y-3 w-full">
                      <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="rounded-lg border-2 border-gray-300 w-full max-w-md" videoConstraints={{ facingMode: "user" }} />
                      <button type="button" onClick={captureSelfie} className="w-full bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
                        📸 Capture Selfie
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 w-full">
                      <img src={selfiePreview} alt="selfie preview" className="rounded-lg border-2 border-green-300 w-full max-w-md" />
                      <button type="button" onClick={() => setSelfiePreview(null)} className="w-full bg-gray-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-700 transition">
                        🔄 Retake Selfie
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitStatus === "loading"}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitStatus === "loading" ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : kycStatus === "rejected" ? "Resubmit KYC Application" : "Submit KYC Application"}
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