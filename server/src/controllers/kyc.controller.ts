import type { Request, Response } from "express";
import sendResponse from "../utils/api.response.js";
import { uploadToCloudinaryDetails } from "../services/cloudinary.service.js";
import { notifyAdminsForKyc } from "../services/notification.service.js";
import {
  upsertKycForUser,
  sendMailToAllAdmins,
  isVerifedService
} from "../services/kyc.service.js";

import crypto from "crypto";

export const submitKyc = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id as string | undefined;
    if (!userId) {
      return sendResponse({
        res,
        statusCode: 401,
        success: false,
        message: "Not authorized",
      });
    }

    const otpVerified = await isVerifedService(userId);

    if (!otpVerified) {
      return sendResponse({
        res,
        statusCode: 400,
        success: false,
        message: "Your e-mail is not verified",
      });
    }

    const {
      firstName,
      middleName,
      lastName,
      dob,
      phone,
      address,
      documents
    } = req.body as {
      firstName: string;
      middleName?: string;
      lastName: string;
      dob: string;
      phone: string;
      address: {
        residentialAddress: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
      };
      documents: {
        aadhaar: { aadhaarNumber: string };
        pan: { panNumber: string };
      };
    };

    const { residentialAddress, city, state, pincode, country } = address;
    const { aadhaarNumber } = documents.aadhaar;
    const { panNumber } = documents.pan;

    const files = req.files as Express.Multer.File[];

    // Find files by fieldname (partial match to accept various nesting)
    const aadhaarFile = files?.find(f => f.fieldname.includes("aadhaar"));
    const panFile = files?.find(f => f.fieldname.includes("pan"));

    if (!aadhaarFile || !panFile) {
      return sendResponse({
        res,
        statusCode: 400,
        success: false,
        message: "Aadhaar and PAN documents are required",
      });
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
    console.error("Error in submitKyc:", err);
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: "Failed to submit KYC",
      errors: err?.message ?? "Something went wrong",
    });
  }
};
