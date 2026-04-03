// import api from ""; // your axios instance

import api from "./axios";

export interface KycData {
  id: string;
  fullName: string;
  documentNumber: string;
  status: "pending" | "approved" | "rejected" | "NOT_SUBMITTED";
  rejectionReason?: string;
}


export interface SubmitKycPayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  dob: string;
  phone: string;

  address?: string; // Optional — generated dynamically during submission
  residentialAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;

  aadhaarNumber: string;
  panNumber: string;

  aadhaarImage: FileList;
  panImage: FileList;
  selfie: FileList;
}


export const submitKyc = async (payload: SubmitKycPayload) => {
  try {
    console.log("Starting KYC combined submission payload:", payload);
    const form = new FormData();

    form.append("firstName", String(payload.firstName));
    form.append("middleName", String(payload.middleName || ""));
    form.append("lastName", String(payload.lastName));
    form.append("dob", String(payload.dob));
    form.append("phone", String(payload.phone));

    // address → nested JSON
    form.append(
      "address",
      JSON.stringify({
        residentialAddress: payload.residentialAddress,
        city: payload.city,
        state: payload.state,
        pincode: payload.pincode,
        country: payload.country || "IN",
      })
    );

    // documents → nested JSON
    form.append(
      "documents",
      JSON.stringify({
        aadhaar: { aadhaarNumber: payload.aadhaarNumber },
        pan: { panNumber: payload.panNumber },
      })
    );

    // Safe File Appending
    if (payload.aadhaarImage && payload.aadhaarImage.length > 0) {
      console.log("Appending Aadhaar file...");
      form.append("aadhaarFile", payload.aadhaarImage[0]);
    } else {
      console.warn("Aadhaar image missing in payload despite validation");
    }

    if (payload.panImage && payload.panImage.length > 0) {
      console.log("Appending PAN file...");
      form.append("panFile", payload.panImage[0]);
    } else {
      console.warn("PAN image missing in payload despite validation");
    }

    let token = "";
    try {
      const rawToken = localStorage.getItem("token");
      if (rawToken) {
        token = JSON.parse(rawToken);
      }
    } catch (e) {
      console.error("Error parsing token for KYC submission:", e);
    }

    console.log("Sending POST request to /kyc/submit...");
    const res = await api.post("/kyc/submit", form, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("KYC Submission Response:", res.data);
    return res.data;
  } catch (error: any) {
    console.error("FATAL ERROR in submitKyc service:", error);
    throw error; // Re-throw to be caught by Saga
  }
};

export const fetchKycStatus = async (userId: string) => {
  let token = "";
  try {
    const rawToken = localStorage.getItem("token");
    if (rawToken) {
      token = JSON.parse(rawToken);
    }
  } catch (e) {
    // Silence error, will result in unauthorized if truly missing
  }

  const res = await api.get(`/kyc/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(res.data, "datatatata");
  return res.data; // ← return full axios response data (your sendResponse wrapper)
};