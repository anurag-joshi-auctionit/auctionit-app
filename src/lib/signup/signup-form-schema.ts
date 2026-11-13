import { BiddersInfoMessages } from "@auctionit/messages/bidders";
import type { SignupLocationValue } from "@/components/signup/signup-location-select";

export const SIGNUP_STEPS = [
  {
    key: "company",
    label: "Company Information",
    description: "Company details, tax IDs, and materials",
  },
  {
    key: "user",
    label: "User Information",
    description: BiddersInfoMessages.CREDENTIALS_WILL_BE_EMAILED,
  },
] as const;

export const SIGNUP_COMPANY_STEP_FIELDS = [
  "companyName",
  "gstin",
  "pan",
  "location",
  "pincode",
  "materials",
] as const;

export const SIGNUP_USER_STEP_FIELDS = [
  "name",
  "userLoginName",
  "emailId",
  "phoneNumber",
] as const;

export type SignupFormValues = {
  companyName: string;
  name: string;
  userLoginName: string;
  emailId: string;
  phoneNumber: string;
  location: SignupLocationValue;
  pincode: string;
  gstin: string;
  pan: string;
  materials: number[];
};

export type SignupRequestBody = {
  companyName: string;
  name: string;
  userLoginName: string;
  emailId: string;
  phoneNumber: string;
  locationId: number | null;
  pincode: string;
  gstin: string;
  pan: string;
  materials: number[];
};

export function signupStepIndexForField(formPath: string): number {
  if (
    (SIGNUP_COMPANY_STEP_FIELDS as readonly string[]).includes(formPath) ||
    formPath === "locationId"
  ) {
    return 0;
  }
  return 1;
}

export function emptySignupFormValues(): SignupFormValues {
  return {
    companyName: "",
    name: "",
    userLoginName: "",
    emailId: "",
    phoneNumber: "",
    location: {
      locationId: null,
      city: null,
      state: null,
      country: null,
    },
    pincode: "",
    gstin: "",
    pan: "",
    materials: [],
  };
}

export function toSignupRequestBody(v: SignupFormValues): SignupRequestBody {
  return {
    companyName: v.companyName.trim(),
    name: v.name.trim(),
    userLoginName: v.userLoginName.trim(),
    emailId: v.emailId.trim(),
    phoneNumber: v.phoneNumber.trim(),
    locationId: v.location.locationId,
    pincode: v.pincode.trim(),
    gstin: v.gstin.trim(),
    pan: v.pan.trim(),
    materials: v.materials,
  };
}
