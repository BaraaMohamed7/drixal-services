export const companyStatusValues = ["PENDING", "APPROVED", "SUSPENDED"] as const;

export const Company = defineMongooseModel({
  name: "Company",
  schema: {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: companyStatusValues,
      default: "PENDING",
    },
    location: {
      city: {
        type: String,
        default: "",
        trim: true,
      },
      area: {
        type: String,
        default: "",
        trim: true,
      },
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  options: {
    collection: "companies",
    timestamps: true,
  },
  hooks(schema) {
    schema.index({ slug: 1 }, { unique: true });
    schema.index({ status: 1 });
  },
});
