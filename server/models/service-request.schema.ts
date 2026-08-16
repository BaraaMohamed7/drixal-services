import { defineMongooseModel } from "#nuxt/mongoose";
import mongoose from "mongoose";

export const serviceRequestStatusValues = ["NEW", "UNDER_REVIEW", "APPROVED", "REJECTED", "CONVERTED", "CANCELLED", "CONTACTED", "CLOSED"] as const;
export type ServiceRequestStatus = (typeof serviceRequestStatusValues)[number];

export interface ServiceRequestDocument {
  _id: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  requesterUserId?: mongoose.Types.ObjectId;
  customer: {
    name: string;
    phone: string;
    email: string;
    city: string;
  };
  message: string;
  preferredDate?: Date;
  status: ServiceRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

export const ServiceRequest = defineMongooseModel<ServiceRequestDocument>({
  name: "ServiceRequest",
  schema: {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    requesterUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    customer: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        default: "",
        trim: true,
        lowercase: true,
      },
      city: {
        type: String,
        default: "",
        trim: true,
      },
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    preferredDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: serviceRequestStatusValues,
      default: "NEW",
    },
  },
  options: {
    collection: "service_requests",
    timestamps: true,
  },
  hooks(schema) {
    schema.index({ companyId: 1, status: 1, createdAt: -1 });
    schema.index({ serviceId: 1, createdAt: -1 });
    schema.index({ requesterUserId: 1, createdAt: -1 });
  },
});
