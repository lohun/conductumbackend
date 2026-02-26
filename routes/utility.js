import { fromNodeHeaders } from 'better-auth/node';
import { supabase } from '../client.ts';
import { systemLogger } from '../logger.ts';
import { auth } from '../auth.ts';
/**
 * Checks HTTP cookies and signed (secure) cookies for secure tokens
 * and identifies the corresponding users from the database.
 */
export const identifyUsersByCookies = async (req) => {
    systemLogger.info(`Utility: IDENTIFYING USER BY COOKIES`);
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers)
    });
    if (!session) {
        systemLogger.info(`Utility: NO SESSION FOUND`);
        return {
            user: null,
            organization: null
        };
    }
    systemLogger.info(`Utility: SESSION FOUND FOR USER ID: ${session.user.id}`);
    const { data: organization, error } = await supabase
        .from('member')
        .select('organizationId, organization!inner(*)') // Assuming a join
        .eq('userId', session.user.id)
        .single();
    if (error) {
        systemLogger.error(`Utility: SUPABASE ERROR IDENTIFYING MEMBER: ${error.message}`);
        return {
            user: null,
            organization: null
        };
    }
    systemLogger.info(`Utility: ORGANIZATION IDENTIFIED: ${organization?.organizationId}`);
    return {
        user: session.user,
        organization: organization
    };
};
//# sourceMappingURL=utility.js.map