// 
import type { Request } from 'express';
import { auth } from '../auth.ts';
import { fromNodeHeaders } from 'better-auth/node';
import { supabase } from '../client.ts';

/**
 * Checks HTTP cookies and signed (secure) cookies for secure tokens 
 * and identifies the corresponding users from the database.
 */
export const identifyUsersByCookies = async (req: Request) => {
    const session = await auth.api.getSession(
        {
            headers: fromNodeHeaders(req.headers)
        }
    );

    if (!session) {
        return {
            user: null,
            organization: null
        };
    }

    const { data: organization, error } = await supabase
        .from('member')
        .select('organizationId, organization!inner(*)') // Assuming a join
        .eq('userId', session.user.id)
        .single();



    if (error) {
        return {
            user: null,
            organization: null
        };
    }

    return {
        user: session.user,
        organization: organization
    };
};
