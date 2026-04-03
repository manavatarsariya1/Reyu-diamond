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

  // files (names must contain keywords)
  form.append("aadhaarFile", payload.aadhaarImage[0]);
  form.append("panFile", payload.panImage[0]);

  let token = "";
  try {
    const rawToken = localStorage.getItem("token");
    if (rawToken) {
      token = JSON.parse(rawToken);
    }
  } catch (e) {
    console.error("Error parsing token for KYC submission:", e);
  }

  const res = await api.post("/kyc/submit", form, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });


  return res.data;
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