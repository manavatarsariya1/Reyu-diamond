import type { Request, Response, NextFunction } from "express";
import sendResponse from "../utils/api.response.js";
import { uploadToCloudinaryDetails } from "../services/cloudinary.service.js";
import { notifyAdminsForKyc } from "../services/notification.service.js";
import {
  upsertKycForUser,
  sendMailToAllAdmins,
  isVerifedService
} from "../services/kyc.service.js";

import crypto from "crypto";

export const submitKyc = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("hello bhai from submitkyc controller")
    const userId = (req as any).user?.id as string | undefined;
    if (!userId) {
      const err: any = new Error("Not authorized");
      err.statusCode = 401;
      throw err;
    }

    const otpVerified = await isVerifedService(userId);

    if (!otpVerified) {
      const err: any = new Error("Your e-mail is not verified");
      err.statusCode = 400;
      throw err;
    }

    // ✅ PARSE JSON STRINGS FIRST
    const parsedAddress = typeof req.body.address === 'string' 
      ? JSON.parse(req.body.address) 
      : req.body.address;

    const parsedDocuments = typeof req.body.documents === 'string' 
      ? JSON.parse(req.body.documents) 
      : req.body.documents;

    // ✅ NOW destructure with parsed data
    const {
      firstName,
      middleName,
      lastName,
      dob,
      phone,
    } = req.body;

    const address = parsedAddress;
    const documents = parsedDocuments;

    const { residentialAddress, city, state, pincode, country } = address;
    const { aadhaarNumber } = documents.aadhaar;
    const { panNumber } = documents.pan;

    const files = req.files as Express.Multer.File[];

    // Find files by fieldname (partial match to accept various nesting)
    const aadhaarFile = files?.find(f => f.fieldname.includes("aadhaar"));
    const panFile = files?.find(f => f.fieldname.includes("pan"));

    if (!aadhaarFile || !panFile) {
      const err: any = new Error("Aadhaar and PAN documents are required");
      err.statusCode = 400;
      throw err;
    }

    // Helper for hashing
    const hashValue = (value: string) =>
      crypto.createHash("sha256").update(value).digest("hex");

    // Upload documents and get public_id
    const aadhaarUpload = await uploadToCloudinaryDetails(
      aadhaarFile,
      "kyc/aadhaar"
    );
    const panUpload = await uploadToCloudinaryDetails(panFile, "kyc/pan");

    await upsertKycForUser({
      userId,
      firstName,
      middleName,
      lastName,
      dob: new Date(dob),
      phone,
      address: {
        residentialAddress,
        city,
        state,
        pincode,
        country: country || "IN",
      },
      aadhaar: {
        aadhaarHash: hashValue(aadhaarNumber),
        aadhaarNumber,
        url: aadhaarUpload.secure_url,
        publicId: aadhaarUpload.public_id,
      },
      pan: {
        panHash: hashValue(panNumber),
        panNumber,
        url: panUpload.secure_url,
        publicId: panUpload.public_id,
      },
    });

    await notifyAdminsForKyc(userId);
    await sendMailToAllAdmins(userId);

    return sendResponse({
      res,
      statusCode: 201,
      success: true,
      message: "KYC submitted successfully. Awaiting admin approval.",
    });
  } catch (err: any) {
    next(err);
  }
}; 
