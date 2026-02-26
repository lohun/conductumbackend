import { betterAuth } from 'better-auth';
import { admin, organization, phoneNumber } from 'better-auth/plugins';
import { Pool } from "pg";
import { config } from 'dotenv';
config();
export const auth = betterAuth({
    database: new Pool({
        connectionString: process.env.DATABASE_URL,
    }),
    baseURL: process.env.BETTER_AUTH_URL,
    emailAndPassword: {
        enabled: true,
    },
    secret: process.env.BETTER_AUTH_SECRET,
    plugins: [admin(), phoneNumber(), organization()],
    user: {
        additionalFields: {
            userMetadata: {
                type: 'json',
                required: false,
                input: false,
            },
            appMetadata: {
                type: 'json',
                required: false,
                input: false,
            },
            invitedAt: {
                type: 'date',
                required: false,
                input: false,
            },
            lastSignInAt: {
                type: 'date',
                required: false,
                input: false,
            },
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
    },
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    // Create default organization
                    await auth.api.createOrganization({
                        body: {
                            userId: user.id,
                            name: `${user.name || user.email.split('@')[0]}'s Organization`,
                            // Generate a unique slug to avoid collisions
                            slug: `${user.email.split('@')[0]}-${Date.now()}`.toLowerCase(),
                        },
                    });
                },
            },
        },
    },
    trustedOrigins: ["http://localhost:8080", "http://127.0.0.1:8080"]
});
//# sourceMappingURL=auth.js.map