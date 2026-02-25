// import api from ""; // your axios instance

import api from "./axios";

export interface KycData {
  id: string;
  fullName: string;
  documentNumber: string;
  status: "pending" | "approved" | "rejected";
}

export interface SubmitKycPayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  dob: string;
  phone: string;

  address: string;
  residentialAddress: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;

  aadhaarNumber: string;
  panNumber: string;

  aadhaarImage: FileList;
  panImage: FileList;
}


export const submitKyc = async (payload: SubmitKycPayload) => {

 const form = new FormData();

form.append("firstName", payload.firstName);
form.append("middleName", payload.middleName || "");
form.append("lastName", payload.lastName);
form.append("dob", payload.dob);
form.append("phone", payload.phone);

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

const token = JSON.parse(localStorage.getItem("token") || "")
const res = await api.post("/kyc/submit", form, {
  headers: { 
    "Content-Type": "multipart/form-data",
    Authorization: `Bearer ${token}`,
  },
});


  return res.data;
};

export const fetchKyc = async () => {
  const { data } = await api.get("/kyc");
  return data;
};

// export const updateKyc = async (payload: SubmitKycPayload) => {
//   const formData = new FormData();
//   formData.append("fullName", payload.fullName);
//   formData.append("documentNumber", payload.documentNumber);
//   formData.append("documentFile", payload.documentFile);

//   const { data } = await api.put("/kyc/update", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });

//   return data;
// };
