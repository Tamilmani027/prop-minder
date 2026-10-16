import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppError } from "../../utils/AppError";
import { env } from "../../config/env";
import { Organization, type OrganizationDoc } from "../organization/organization.model";
import { User, type UserDoc } from "../user/user.model";
import type { RegisterInput, LoginInput } from "./auth.schema";

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: "owner" | "manager";
  orgId: string;
}

/**
 * Sign a JWT containing { userId, orgId }. Both ids are passed as strings.
 */
export function signToken(userId: string, orgId: string): string {
  // jwtSecret is required at runtime; .env.example provides a placeholder.
  return jwt.sign({ userId, orgId }, env.jwtSecret!, {
    expiresIn: env.jwtExpiresInSeconds,
  });
}

function toUserResponse(user: UserDoc): UserResponse {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    orgId: user.orgId.toString(),
  };
}

export async function register(input: RegisterInput) {
  const { orgName, name, email, password } = input;

  // Check the email is free. skipTenant because registration happens before an org
  // exists; the email unique index is global so the check must span all orgs.
  // skipTenant() is added by tenantPlugin; Mongoose types don't know about it,
  // so we cast through any. Registration runs before an org exists, so the
  // global email index must be checked across all orgs.
  const existing = await (User.findOne({ email }) as any).skipTenant().lean();
  if (existing) {
    throw new AppError(409, 'CONFLICT', 'Email already registered');
  }

  let organization: OrganizationDoc | null = null;
  try {
    organization = await Organization.create({ name: orgName });
    const passwordHash = await bcrypt.hash(password, 10);
    // Mongoose's typed create() doesn't accept a plain object literal with
    // orgId set from a different model instance, so we cast through any.
    const user = await User.create(
      {
        orgId: organization._id,
        name,
        email,
        passwordHash,
      } as any
    );
    const token = signToken(user._id.toString(), organization._id.toString());
    // User.create returns a typed document but the service layer works with the
    // Doc interface; cast through unknown for the boundary.
    return { token, user: toUserResponse(user as unknown as UserDoc) };
  } catch (error) {
    // Compensation: if user creation failed after the org was created, delete the org
    // so we don't leave an orphaned organization behind.
    if (organization) {
      // eslint-disable-next-line no-console
      console.warn("Deleting organization after failed user creation", organization._id);
      await Organization.deleteOne({ _id: organization._id });
    }
    // Duplicate-key (11000) race on the global email index: another request registered
    // the same email between our check and the insert.
    // error is the raw Mongo error object; cast through any to read .code.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).code === 11000) {
      throw new AppError(409, 'CONFLICT', 'Email already registered');
    }
    throw error;
  }
}

export async function login(input: LoginInput) {
  const { email, password } = input;

  // skipTenant because login happens before the org is known; lookup by the global
  // email index across all orgs.
  // skipTenant() is added by tenantPlugin; Mongoose types don't know about it,
  // so we cast through any. Login runs before the org is known, so the lookup
  // must span all orgs via the global email index.
  const user = await (User.findOne({ email }) as any).skipTenant().select("+passwordHash");

  // When the user doesn't exist, still run bcrypt.compare against a dummy hash so the
  // response timing is similar for unknown emails and wrong passwords. This prevents
  // attackers from enumerating registered emails via timing differences.
  const dummyHash = "$2a$10$invalidinvalidinvalidinvalidinvalidinv";
  const isValid = user
    ? await bcrypt.compare(password, user.passwordHash)
    : await bcrypt.compare(password, dummyHash);

  if (!user || !isValid) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password');
  }

  const token = signToken(user._id.toString(), user.orgId.toString());
  // User document typed by Mongoose; cast through unknown for the service boundary.
  return { token, user: toUserResponse(user as unknown as UserDoc) };
}
