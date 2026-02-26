import type { Request } from 'express';
/**
 * Checks HTTP cookies and signed (secure) cookies for secure tokens
 * and identifies the corresponding users from the database.
 */
export declare const identifyUsersByCookies: (req: Request) => Promise<{
    user: null;
    organization: null;
} | {
    user: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        emailVerified: boolean;
        name: string;
        image?: string | null | undefined | undefined;
        userMetadata?: Record<string, any> | null | undefined;
        appMetadata?: Record<string, any> | null | undefined;
        invitedAt?: Date | null | undefined;
        lastSignInAt?: Date | null | undefined;
        banned: boolean | null | undefined;
        role?: string | null | undefined;
        banReason?: string | null | undefined;
        banExpires?: Date | null | undefined;
        phoneNumber?: string | null | undefined;
        phoneNumberVerified?: boolean | null | undefined;
    };
    organization: {
        organizationId: any;
        organization: any[];
    };
}>;
//# sourceMappingURL=utility.d.ts.map