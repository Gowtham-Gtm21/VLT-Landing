import mongoose from 'mongoose';

const attributionSchema = new mongoose.Schema(
  {
    utm_source: String,
    utm_medium: String,
    utm_campaign: String,
    utm_content: String,
    utm_term: String,
    fbclid: String,
    landingPath: String,
    referrer: String,
  },
  { _id: false }
);

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    company: { type: String, trim: true, maxlength: 160, default: '' },
    service: {
      type: String,
      enum: [
        'Product engineering',
        'Drone & UAV systems',
        'IoT platform',
        'Web & mobile application',
        'AI & Cloud',
        'Not sure yet',
      ],
      default: 'Not sure yet',
    },
    projectDetails: { type: String, trim: true, maxlength: 2000, default: '' },

    // where the lead sits: 'new' on submit, 'appointment_booked' once they
    // pick a slot, then whatever the team moves it to afterwards
    status: {
      type: String,
      enum: ['new', 'appointment_booked', 'appointment_cancelled', 'contacted', 'qualified', 'closed'],
      default: 'new',
      index: true,
    },
    scheduledAt: { type: Date, default: null },
    calendlyEventUri: { type: String, default: '' },
    calendlyInviteeUri: { type: String, default: '' },
    contactedAt: { type: Date, default: null },
    notes: { type: String, trim: true, maxlength: 2000, default: '' },

    attribution: { type: attributionSchema, default: () => ({}) },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
);

leadSchema.index({ email: 1, createdAt: -1 });

export default mongoose.model('Lead', leadSchema);
