import { defineMongooseModel } from "#nuxt/mongoose";
import mongoose from "mongoose";

export const serviceOrderStatusValues = ["DRAFT", "SCHEDULED", "ASSIGNED", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"] as const;
export const serviceOrderPriorityValues = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export const serviceOrderLineStatusValues = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;

export type ServiceOrderStatus = (typeof serviceOrderStatusValues)[number];
export type ServiceOrderPriority = (typeof serviceOrderPriorityValues)[number];
export type ServiceOrderLineStatus = (typeof serviceOrderLineStatusValues)[number];

export interface ServiceOrderLineDocument {
  title: string;
  quantity: number;
  assignedTo: string;
  status: ServiceOrderLineStatus;
  cost: {
    amount?: number;
    currency: string;
  };
}

export interface ServiceOrderDocument {
  _id: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  requestId?: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  customerUserId?: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  orderNumber: string;
  title: string;
  description: string;
  priority: ServiceOrderPriority;
  status: ServiceOrderStatus;
  scheduledDate?: Date;
  assignedTo: string;
  assignedUserId?: mongoose.Types.ObjectId;
  lines: ServiceOrderLineDocument[];
  createdAt: Date;
  updatedAt: Date;
}

export const ServiceOrder = defineMongooseModel<ServiceOrderDocument>({
  name: "ServiceOrder",
  schema: {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    customerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    priority: {
      type: String,
      enum: serviceOrderPriorityValues,
      default: "MEDIUM",
    },
    status: {
      type: String,
      enum: serviceOrderStatusValues,
      default: "DRAFT",
    },
    scheduledDate: {
      type: Date,
    },
    assignedTo: {
      type: String,
      default: "",
      trim: true,
    },
    assignedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lines: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        quantity: {
          type: Number,
          min: 1,
          default: 1,
        },
        assignedTo: {
          type: String,
          default: "",
          trim: true,
        },
        status: {
          type: String,
          enum: serviceOrderLineStatusValues,
          default: "PENDING",
        },
        cost: {
          amount: {
            type: Number,
            min: 0,
          },
          currency: {
            type: String,
            default: "EGP",
            uppercase: true,
            trim: true,
          },
        },
      },
    ],
  },
  options: {
    collection: "service_orders",
    timestamps: true,
  },
  hooks(schema) {
    schema.index({ companyId: 1, status: 1, createdAt: -1 });
    schema.index({ companyId: 1, orderNumber: 1 }, { unique: true });
    schema.index({ companyId: 1, requestId: 1 }, { unique: true, partialFilterExpression: { requestId: { $type: "objectId" } } });
    schema.index({ customerUserId: 1, createdAt: -1 });
    schema.index({ companyId: 1, assignedUserId: 1, status: 1 });
  },
});
