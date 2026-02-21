// 
import type { Request } from 'express';
import { auth } from '../auth.ts';
import { fromNodeHeaders } from 'better-auth/node';

/**
 * Checks HTTP cookies and signed (secure) cookies for secure tokens 
 * and identifies the corresponding users from the database.
 */
export const identifyUsersByCookies = async (req: Request, db: any) => {
    const session = await auth.api.getSession(
        {
            headers: fromNodeHeaders(req.headers)
        }
    );

    if (!session) {
        return null;
    }

    return {
        user: session.user,
    };
};
