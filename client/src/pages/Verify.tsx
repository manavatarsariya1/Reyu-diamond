import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
// import { verifyUser } from "../api/auth.service";
import { useDispatch } from "react-redux";
import { registerRequested } from "@/features/auth/auth.Slice";
// import { loginSuccess } from "../features/auth/authSlice";

// --- Types ---
type VerifyFormData = {
    email: string;
    otp: string;
};

type LocationState = {
    email?: string;
    user?: any; // replace with your User type later
};

const Verify: React.FC = () => {
    const { state } = useLocation() as { state: LocationState };
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const email = state?.email || sessionStorage.getItem("otp_email");
    const user = state?.user;

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<VerifyFormData>();

    // Prefill email
    useEffect(() => {
        if (!email) {
            navigate("/login");
            return;
        }
        setValue("email", email);
        sessionStorage.setItem("otp_email", email);
    }, [email, navigate, setValue]);

    const onSubmit = async (data: VerifyFormData) => {

        dispatch(registerRequested(user))
        if(true){

            navigate("/kyc")
        }
        // try {
        //   const res = await verifyUser(data);

        //   if (res.data.success) {
        //     toast.success("OTP verified successfully");
        //     sessionStorage.removeItem("otp_email");
        //     dispatch(loginSuccess(user));
        //     navigate("/login");
        //   }
        // } catch (error: any) {
        //   toast.error(error?.response?.data?.message || "Invalid OTP");
        // }
        // if (res.data.success) {

        // sessionStorage.setItem("otp_email", data.email);
        // navigate("/verify-otp", {
        //     state: {
        //         email: data.email,
        //         user: res.data.data.user
        //     }
        // });

        // }
    };

    return (
        <div className="flex justify-center items-center min-h-screen">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-sm p-6 border rounded"
            >
                <h2 className="text-xl font-semibold mb-4">Verify OTP</h2>

                <input
                    type="email"
                    readOnly
                    className="w-full mb-3 p-2 border rounded bg-gray-100"
                    {...register("email")}
                />

                <input
                    type="text"
                    placeholder="Enter OTP"
                    className="w-full mb-2 p-2 border rounded"
                    {...register("otp", {
                        required: "OTP is required",
                        minLength: { value: 4, message: "Invalid OTP" },
                        maxLength: { value: 6, message: "Invalid OTP" },
                    })}
                />

                {errors.otp && (
                    <p className="text-red-500 text-sm">{errors.otp.message}</p>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-4 bg-black text-white py-2 rounded"
                >
                    {isSubmitting ? "Verifying..." : "Verify OTP"}
                </button>
            </form>
        </div>
    );
};

export default Verify;
