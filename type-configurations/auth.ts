export interface User {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
    role?: string | null;
    banned?: boolean | null;
    banReason?: string | null;
    banExpires?: Date | null;
    phoneNumber?: string | null;
    phoneNumberVerified?: boolean | null;
    userMetadata?: any;
    appMetadata?: any;
    invitedAt?: Date | null;
    lastSignInAt?: Date | null;
}

export interface Session {
    id: string;
    expiresAt: Date;
    token: string;
    createdAt: Date;
    updatedAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
    userId: string;
    impersonatedBy?: string | null;
    activeOrganizationId?: string | null;
}

export interface Account {
    id: string;
    accountId: string;
    providerId: string;
    userId: string;
    accessToken?: string | null;
    refreshToken?: string | null;
    idToken?: string | null;
    accessTokenExpiresAt?: Date | null;
    refreshTokenExpiresAt?: Date | null;
    scope?: string | null;
    password?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Verification {
    id: string;
    identifier: string;
    value: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface Organization {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
    createdAt: Date;
    metadata?: string | null;
}

export interface Member {
    id: string;
    organizationId: string;
    userId: string;
    role: string;
    createdAt: Date;
}

export interface Invitation {
    id: string;
    organizationId: string;
    email: string;
    role?: string | null;
    status: string;
    expiresAt: Date;
    createdAt: Date;
    inviterId: string;
}
