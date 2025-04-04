/**
 * User model schema definition
 * Implements the IUser interface with MongoDB schema
 */
import { Schema, model, Document, Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { IUser, IUserOrganization, IUserPreferences, IUserProfile } from '../interfaces/user.interface';
import { ID, createID } from '@/types/base.types';

// Document interface for methods
export interface IUserDocument extends IUser, Document {
  // Document methods
  comparePassword(password: string): Promise<boolean>;
  getBasicProfile(): {
    id: ID;
    email: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    avatar?: string;
  };
}

// Static model methods
export interface IUserModel extends Model<IUserDocument> {
  // Static methods
  findByEmail(email: string): Promise<IUserDocument | null>;
  findWithActiveStatus(id: string): Promise<IUserDocument | null>;
  findByOrganization(organizationId: string): Promise<IUserDocument[]>;
}

// User Profile Schema
const UserProfileSchema = new Schema<IUserProfile>(
  {
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
    },
    avatar: {
      type: String,
    },
    contact: {
      phone: {
        type: String,
      },
      address: {
        street: {
          type: String,
        },
        city: {
          type: String,
        },
        state: {
          type: String,
        },
        postalCode: {
          type: String,
        },
        country: {
          type: String,
        },
      },
    },
  },
  { _id: false }
);

// User Preferences Schema
const UserPreferencesSchema = new Schema<IUserPreferences>(
  {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    language: {
      type: String,
      default: 'en',
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
      inApp: {
        type: Boolean,
        default: true,
      },
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY',
    },
    timeFormat: {
      type: String,
      default: 'HH:mm',
    },
  },
  { _id: false }
);

// User Organization Schema
const UserOrganizationSchema = new Schema<IUserOrganization>(
  {
    organizationId: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['admin', 'user', 'manager', 'viewer'],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// User Schema
const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'pending', 'locked', 'suspended'],
      default: 'pending',
    },
    profile: {
      type: UserProfileSchema,
      default: () => ({}),
    },
    preferences: {
      type: UserPreferencesSchema,
      default: () => ({}),
    },
    organizations: {
      type: [UserOrganizationSchema],
      default: [],
    },
    lastLoginAt: {
      type: Date,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = createID(ret._id.toString());
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ 'organizations.organizationId': 1 });
UserSchema.index({ status: 1 });

// Methods
UserSchema.methods.comparePassword = async function (
  this: IUserDocument,
  password: string
): Promise<boolean> {
  // This would use bcrypt or another password hashing library
  // For now, just a placeholder implementation
  return Promise.resolve(false);
};

UserSchema.methods.getBasicProfile = function (this: IUserDocument) {
  return {
    id: createID(this._id.toString()),
    email: this.email,
    firstName: this.profile.firstName,
    lastName: this.profile.lastName,
    displayName: this.profile.displayName,
    avatar: this.profile.avatar,
  };
};

// Static methods
UserSchema.statics.findByEmail = async function (
  this: IUserModel,
  email: string
): Promise<IUserDocument | null> {
  return this.findOne({ email: email.toLowerCase() });
};

UserSchema.statics.findWithActiveStatus = async function (
  this: IUserModel,
  id: string
): Promise<IUserDocument | null> {
  return this.findOne({ _id: id, status: 'active' });
};

UserSchema.statics.findByOrganization = async function (
  this: IUserModel,
  organizationId: string
): Promise<IUserDocument[]> {
  return this.find({ 'organizations.organizationId': organizationId });
};

// Create and export model
const UserModel = model<IUserDocument, IUserModel>('User', UserSchema);
export default UserModel;