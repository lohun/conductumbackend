import { Pool } from "pg";
export declare const auth: import("better-auth").Auth<{
    database: Pool;
    baseURL: string;
    emailAndPassword: {
        enabled: true;
    };
    secret: string;
    plugins: [{
        id: "admin";
        init(): {
            options: {
                databaseHooks: {
                    user: {
                        create: {
                            before(user: {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                email: string;
                                emailVerified: boolean;
                                name: string;
                                image?: string | null | undefined;
                            } & Record<string, unknown>): Promise<{
                                data: {
                                    id: string;
                                    createdAt: Date;
                                    updatedAt: Date;
                                    email: string;
                                    emailVerified: boolean;
                                    name: string;
                                    image?: string | null | undefined;
                                    role: string;
                                };
                            }>;
                        };
                    };
                    session: {
                        create: {
                            before(session: {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                userId: string;
                                expiresAt: Date;
                                token: string;
                                ipAddress?: string | null | undefined;
                                userAgent?: string | null | undefined;
                            } & Record<string, unknown>, ctx: import("better-auth").GenericEndpointContext | null): Promise<void>;
                        };
                    };
                };
            };
        };
        hooks: {
            after: {
                matcher(context: import("better-auth").HookEndpointContext): boolean;
                handler: (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<import("better-auth/plugins").SessionWithImpersonatedBy[] | undefined>;
            }[];
        };
        endpoints: {
            setRole: import("better-auth").StrictEndpoint<"/admin/set-role", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    userId: import("better-auth").ZodCoercedString<unknown>;
                    role: import("better-auth").ZodUnion<readonly [import("better-auth").ZodString, import("better-auth").ZodArray<import("better-auth").ZodString>]>;
                }, import("better-auth").$strip>;
                requireHeaders: true;
                use: ((inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        user: import("better-auth/plugins").UserWithRole;
                        session: import("better-auth").Session;
                    };
                }>)[];
                metadata: {
                    openapi: {
                        operationId: string;
                        summary: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                user: {
                                                    $ref: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                    $Infer: {
                        body: {
                            userId: string;
                            role: "admin" | "user" | ("admin" | "user")[];
                        };
                    };
                };
            }, {
                user: import("better-auth/plugins").UserWithRole;
            }>;
            getUser: import("better-auth").StrictEndpoint<"/admin/get-user", {
                method: "GET";
                query: import("better-auth").ZodObject<{
                    id: import("better-auth").ZodString;
                }, import("better-auth").$strip>;
                use: ((inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        user: import("better-auth/plugins").UserWithRole;
                        session: import("better-auth").Session;
                    };
                }>)[];
                metadata: {
                    openapi: {
                        operationId: string;
                        summary: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                user: {
                                                    $ref: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, import("better-auth/plugins").UserWithRole>;
            createUser: import("better-auth").StrictEndpoint<"/admin/create-user", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    email: import("better-auth").ZodString;
                    password: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    name: import("better-auth").ZodString;
                    role: import("better-auth").ZodOptional<import("better-auth").ZodUnion<readonly [import("better-auth").ZodString, import("better-auth").ZodArray<import("better-auth").ZodString>]>>;
                    data: import("better-auth").ZodOptional<import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodAny>>;
                }, import("better-auth").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                        summary: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                user: {
                                                    $ref: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                    $Infer: {
                        body: {
                            email: string;
                            password?: string | undefined;
                            name: string;
                            role?: "admin" | "user" | ("admin" | "user")[] | undefined;
                            data?: Record<string, any> | undefined;
                        };
                    };
                };
            }, {
                user: import("better-auth/plugins").UserWithRole;
            }>;
            adminUpdateUser: import("better-auth").StrictEndpoint<"/admin/update-user", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    userId: import("better-auth").ZodCoercedString<unknown>;
                    data: import("better-auth").ZodRecord<import("better-auth").ZodAny, import("better-auth").ZodAny>;
                }, import("better-auth").$strip>;
                use: ((inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        user: import("better-auth/plugins").UserWithRole;
                        session: import("better-auth").Session;
                    };
                }>)[];
                metadata: {
                    openapi: {
                        operationId: string;
                        summary: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                user: {
                                                    $ref: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, import("better-auth/plugins").UserWithRole>;
            listUsers: import("better-auth").StrictEndpoint<"/admin/list-users", {
                method: "GET";
                use: ((inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        user: import("better-auth/plugins").UserWithRole;
                        session: import("better-auth").Session;
                    };
                }>)[];
                query: import("better-auth").ZodObject<{
                    searchValue: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    searchField: import("better-auth").ZodOptional<import("better-auth").ZodEnum<{
                        name: "name";
                        email: "email";
                    }>>;
                    searchOperator: import("better-auth").ZodOptional<import("better-auth").ZodEnum<{
                        contains: "contains";
                        starts_with: "starts_with";
                        ends_with: "ends_with";
                    }>>;
                    limit: import("better-auth").ZodOptional<import("better-auth").ZodUnion<[import("better-auth").ZodString, import("better-auth").ZodNumber]>>;
                    offset: import("better-auth").ZodOptional<import("better-auth").ZodUnion<[import("better-auth").ZodString, import("better-auth").ZodNumber]>>;
                    sortBy: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    sortDirection: import("better-auth").ZodOptional<import("better-auth").ZodEnum<{
                        asc: "asc";
                        desc: "desc";
                    }>>;
                    filterField: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    filterValue: import("better-auth").ZodOptional<import("better-auth").ZodUnion<[import("better-auth").ZodUnion<[import("better-auth").ZodString, import("better-auth").ZodNumber]>, import("better-auth").ZodBoolean]>>;
                    filterOperator: import("better-auth").ZodOptional<import("better-auth").ZodEnum<{
                        eq: "eq";
                        ne: "ne";
                        lt: "lt";
                        lte: "lte";
                        gt: "gt";
                        gte: "gte";
                        contains: "contains";
                    }>>;
                }, import("better-auth").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                        summary: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                users: {
                                                    type: string;
                                                    items: {
                                                        $ref: string;
                                                    };
                                                };
                                                total: {
                                                    type: string;
                                                };
                                                limit: {
                                                    type: string;
                                                };
                                                offset: {
                                                    type: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                users: import("better-auth/plugins").UserWithRole[];
                total: number;
            }>;
            listUserSessions: import("better-auth").StrictEndpoint<"/admin/list-user-sessions", {
                method: "POST";
                use: ((inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        user: import("better-auth/plugins").UserWithRole;
                        session: import("better-auth").Session;
                    };
                }>)[];
                body: import("better-auth").ZodObject<{
                    userId: import("better-auth").ZodCoercedString<unknown>;
                }, import("better-auth").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                        summary: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                sessions: {
                                                    type: string;
                                                    items: {
                                                        $ref: string;
                                                    };
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                sessions: import("better-auth/plugins").SessionWithImpersonatedBy[];
            }>;
            unbanUser: import("better-auth").StrictEndpoint<"/admin/unban-user", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    userId: import("better-auth").ZodCoercedString<unknown>;
                }, import("better-auth").$strip>;
                use: ((inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        user: import("better-auth/plugins").UserWithRole;
                        session: import("better-auth").Session;
                    };
                }>)[];
                metadata: {
                    openapi: {
                        operationId: string;
                        summary: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                user: {
                                                    $ref: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                user: import("better-auth/plugins").UserWithRole;
            }>;
            banUser: import("better-auth").StrictEndpoint<"/admin/ban-user", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    userId: import("better-auth").ZodCoercedString<unknown>;
                    banReason: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    banExpiresIn: import("better-auth").ZodOptional<import("better-auth").ZodNumber>;
                }, import("better-auth").$strip>;
                use: ((inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        user: import("better-auth/plugins").UserWithRole;
                        session: import("better-auth").Session;
                    };
                }>)[];
                metadata: {
                    openapi: {
                        operationId: string;
                        summary: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                user: {
                                                    $ref: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                user: import("better-auth/plugins").UserWithRole;
            }>;
            impersonateUser: import("better-auth").StrictEndpoint<"/admin/impersonate-user", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    userId: import("better-auth").ZodCoercedString<unknown>;
                }, import("better-auth").$strip>;
                use: ((inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        user: import("better-auth/plugins").UserWithRole;
                        session: import("better-auth").Session;
                    };
                }>)[];
                metadata: {
                    openapi: {
                        operationId: string;
                        summary: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                session: {
                                                    $ref: string;
                                                };
                                                user: {
                                                    $ref: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                session: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    userId: string;
                    expiresAt: Date;
                    token: string;
                    ipAddress?: string | null | undefined;
                    userAgent?: string | null | undefined;
                };
                user: import("better-auth/plugins").UserWithRole;
            }>;
            stopImpersonating: import("better-auth").StrictEndpoint<"/admin/stop-impersonating", {
                method: "POST";
                requireHeaders: true;
            }, {
                session: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    userId: string;
                    expiresAt: Date;
                    token: string;
                    ipAddress?: string | null | undefined;
                    userAgent?: string | null | undefined;
                } & Record<string, any>;
                user: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string;
                    emailVerified: boolean;
                    name: string;
                    image?: string | null | undefined;
                } & Record<string, any>;
            }>;
            revokeUserSession: import("better-auth").StrictEndpoint<"/admin/revoke-user-session", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    sessionToken: import("better-auth").ZodString;
                }, import("better-auth").$strip>;
                use: ((inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        user: import("better-auth/plugins").UserWithRole;
                        session: import("better-auth").Session;
                    };
                }>)[];
                metadata: {
                    openapi: {
                        operationId: string;
                        summary: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                success: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                success: boolean;
            }>;
            revokeUserSessions: import("better-auth").StrictEndpoint<"/admin/revoke-user-sessions", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    userId: import("better-auth").ZodCoercedString<unknown>;
                }, import("better-auth").$strip>;
                use: ((inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        user: import("better-auth/plugins").UserWithRole;
                        session: import("better-auth").Session;
                    };
                }>)[];
                metadata: {
                    openapi: {
                        operationId: string;
                        summary: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                success: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                success: boolean;
            }>;
            removeUser: import("better-auth").StrictEndpoint<"/admin/remove-user", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    userId: import("better-auth").ZodCoercedString<unknown>;
                }, import("better-auth").$strip>;
                use: ((inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        user: import("better-auth/plugins").UserWithRole;
                        session: import("better-auth").Session;
                    };
                }>)[];
                metadata: {
                    openapi: {
                        operationId: string;
                        summary: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                success: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                success: boolean;
            }>;
            setUserPassword: import("better-auth").StrictEndpoint<"/admin/set-user-password", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    newPassword: import("better-auth").ZodString;
                    userId: import("better-auth").ZodCoercedString<unknown>;
                }, import("better-auth").$strip>;
                use: ((inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        user: import("better-auth/plugins").UserWithRole;
                        session: import("better-auth").Session;
                    };
                }>)[];
                metadata: {
                    openapi: {
                        operationId: string;
                        summary: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                status: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                status: boolean;
            }>;
            userHasPermission: import("better-auth").StrictEndpoint<"/admin/has-permission", {
                method: "POST";
                body: import("better-auth").ZodIntersection<import("better-auth").ZodObject<{
                    userId: import("better-auth").ZodOptional<import("better-auth").ZodCoercedString<unknown>>;
                    role: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                }, import("better-auth").$strip>, import("better-auth").ZodUnion<readonly [import("better-auth").ZodObject<{
                    permission: import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodArray<import("better-auth").ZodString>>;
                    permissions: import("better-auth").ZodUndefined;
                }, import("better-auth").$strip>, import("better-auth").ZodObject<{
                    permission: import("better-auth").ZodUndefined;
                    permissions: import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodArray<import("better-auth").ZodString>>;
                }, import("better-auth").$strip>]>>;
                metadata: {
                    openapi: {
                        description: string;
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object";
                                        properties: {
                                            permission: {
                                                type: string;
                                                description: string;
                                                deprecated: boolean;
                                            };
                                            permissions: {
                                                type: string;
                                                description: string;
                                            };
                                        };
                                        required: string[];
                                    };
                                };
                            };
                        };
                        responses: {
                            "200": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                error: {
                                                    type: string;
                                                };
                                                success: {
                                                    type: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                    $Infer: {
                        body: ({
                            permission: {
                                readonly user?: ("set-role" | "create" | "update" | "delete" | "list" | "get" | "ban" | "impersonate" | "set-password")[] | undefined;
                                readonly session?: ("delete" | "list" | "revoke")[] | undefined;
                            };
                            permissions?: never | undefined;
                        } | {
                            permissions: {
                                readonly user?: ("set-role" | "create" | "update" | "delete" | "list" | "get" | "ban" | "impersonate" | "set-password")[] | undefined;
                                readonly session?: ("delete" | "list" | "revoke")[] | undefined;
                            };
                            permission?: never | undefined;
                        }) & {
                            userId?: string | undefined;
                            role?: "admin" | "user" | undefined;
                        };
                    };
                };
            }, {
                error: null;
                success: boolean;
            }>;
        };
        $ERROR_CODES: {
            readonly FAILED_TO_CREATE_USER: "Failed to create user";
            readonly USER_ALREADY_EXISTS: "User already exists.";
            readonly USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "User already exists. Use another email.";
            readonly YOU_CANNOT_BAN_YOURSELF: "You cannot ban yourself";
            readonly YOU_ARE_NOT_ALLOWED_TO_CHANGE_USERS_ROLE: "You are not allowed to change users role";
            readonly YOU_ARE_NOT_ALLOWED_TO_CREATE_USERS: "You are not allowed to create users";
            readonly YOU_ARE_NOT_ALLOWED_TO_LIST_USERS: "You are not allowed to list users";
            readonly YOU_ARE_NOT_ALLOWED_TO_LIST_USERS_SESSIONS: "You are not allowed to list users sessions";
            readonly YOU_ARE_NOT_ALLOWED_TO_BAN_USERS: "You are not allowed to ban users";
            readonly YOU_ARE_NOT_ALLOWED_TO_IMPERSONATE_USERS: "You are not allowed to impersonate users";
            readonly YOU_ARE_NOT_ALLOWED_TO_REVOKE_USERS_SESSIONS: "You are not allowed to revoke users sessions";
            readonly YOU_ARE_NOT_ALLOWED_TO_DELETE_USERS: "You are not allowed to delete users";
            readonly YOU_ARE_NOT_ALLOWED_TO_SET_USERS_PASSWORD: "You are not allowed to set users password";
            readonly BANNED_USER: "You have been banned from this application";
            readonly YOU_ARE_NOT_ALLOWED_TO_GET_USER: "You are not allowed to get user";
            readonly NO_DATA_TO_UPDATE: "No data to update";
            readonly YOU_ARE_NOT_ALLOWED_TO_UPDATE_USERS: "You are not allowed to update users";
            readonly YOU_CANNOT_REMOVE_YOURSELF: "You cannot remove yourself";
            readonly YOU_ARE_NOT_ALLOWED_TO_SET_NON_EXISTENT_VALUE: "You are not allowed to set a non-existent role value";
            readonly YOU_CANNOT_IMPERSONATE_ADMINS: "You cannot impersonate admins";
            readonly INVALID_ROLE_TYPE: "Invalid role type";
        };
        schema: {
            user: {
                fields: {
                    role: {
                        type: "string";
                        required: false;
                        input: false;
                    };
                    banned: {
                        type: "boolean";
                        defaultValue: false;
                        required: false;
                        input: false;
                    };
                    banReason: {
                        type: "string";
                        required: false;
                        input: false;
                    };
                    banExpires: {
                        type: "date";
                        required: false;
                        input: false;
                    };
                };
            };
            session: {
                fields: {
                    impersonatedBy: {
                        type: "string";
                        required: false;
                    };
                };
            };
        };
        options: NoInfer<import("better-auth/plugins").AdminOptions>;
    }, {
        id: "phone-number";
        hooks: {
            before: {
                matcher: (ctx: import("better-auth").HookEndpointContext) => boolean;
                handler: (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<never>;
            }[];
        };
        endpoints: {
            signInPhoneNumber: import("better-auth").StrictEndpoint<"/sign-in/phone-number", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    phoneNumber: import("better-auth").ZodString;
                    password: import("better-auth").ZodString;
                    rememberMe: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                }, import("better-auth").$strip>;
                metadata: {
                    openapi: {
                        summary: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                user: {
                                                    $ref: string;
                                                };
                                                session: {
                                                    $ref: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                            400: {
                                description: string;
                            };
                        };
                    };
                };
            }, {
                token: string;
                user: import("better-auth/plugins").UserWithPhoneNumber;
            }>;
            sendPhoneNumberOTP: import("better-auth").StrictEndpoint<"/phone-number/send-otp", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    phoneNumber: import("better-auth").ZodString;
                }, import("better-auth").$strip>;
                metadata: {
                    openapi: {
                        summary: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                message: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                message: string;
            }>;
            verifyPhoneNumber: import("better-auth").StrictEndpoint<"/phone-number/verify", {
                method: "POST";
                body: import("better-auth").ZodIntersection<import("better-auth").ZodObject<{
                    phoneNumber: import("better-auth").ZodString;
                    code: import("better-auth").ZodString;
                    disableSession: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    updatePhoneNumber: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                }, import("better-auth").$strip>, import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodAny>>;
                metadata: {
                    openapi: {
                        summary: string;
                        description: string;
                        responses: {
                            "200": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                status: {
                                                    type: string;
                                                    description: string;
                                                    enum: boolean[];
                                                };
                                                token: {
                                                    type: string;
                                                    nullable: boolean;
                                                    description: string;
                                                };
                                                user: {
                                                    type: string;
                                                    nullable: boolean;
                                                    properties: {
                                                        id: {
                                                            type: string;
                                                            description: string;
                                                        };
                                                        email: {
                                                            type: string;
                                                            format: string;
                                                            nullable: boolean;
                                                            description: string;
                                                        };
                                                        emailVerified: {
                                                            type: string;
                                                            nullable: boolean;
                                                            description: string;
                                                        };
                                                        name: {
                                                            type: string;
                                                            nullable: boolean;
                                                            description: string;
                                                        };
                                                        image: {
                                                            type: string;
                                                            format: string;
                                                            nullable: boolean;
                                                            description: string;
                                                        };
                                                        phoneNumber: {
                                                            type: string;
                                                            description: string;
                                                        };
                                                        phoneNumberVerified: {
                                                            type: string;
                                                            description: string;
                                                        };
                                                        createdAt: {
                                                            type: string;
                                                            format: string;
                                                            description: string;
                                                        };
                                                        updatedAt: {
                                                            type: string;
                                                            format: string;
                                                            description: string;
                                                        };
                                                    };
                                                    required: string[];
                                                    description: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                            400: {
                                description: string;
                            };
                        };
                    };
                };
            }, {
                status: boolean;
                token: string;
                user: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string;
                    emailVerified: boolean;
                    name: string;
                    image?: string | null | undefined;
                } & import("better-auth/plugins").UserWithPhoneNumber;
            } | {
                status: boolean;
                token: null;
                user: import("better-auth/plugins").UserWithPhoneNumber;
            }>;
            requestPasswordResetPhoneNumber: import("better-auth").StrictEndpoint<"/phone-number/request-password-reset", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    phoneNumber: import("better-auth").ZodString;
                }, import("better-auth").$strip>;
                metadata: {
                    openapi: {
                        description: string;
                        responses: {
                            "200": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                status: {
                                                    type: string;
                                                    description: string;
                                                    enum: boolean[];
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                status: boolean;
            }>;
            resetPasswordPhoneNumber: import("better-auth").StrictEndpoint<"/phone-number/reset-password", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    otp: import("better-auth").ZodString;
                    phoneNumber: import("better-auth").ZodString;
                    newPassword: import("better-auth").ZodString;
                }, import("better-auth").$strip>;
                metadata: {
                    openapi: {
                        description: string;
                        responses: {
                            "200": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                status: {
                                                    type: string;
                                                    description: string;
                                                    enum: boolean[];
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                status: boolean;
            }>;
        };
        schema: {
            user: {
                fields: {
                    phoneNumber: {
                        type: "string";
                        required: false;
                        unique: true;
                        sortable: true;
                        returned: true;
                    };
                    phoneNumberVerified: {
                        type: "boolean";
                        required: false;
                        returned: true;
                        input: false;
                    };
                };
            };
        };
        rateLimit: {
            pathMatcher(path: string): boolean;
            window: number;
            max: number;
        }[];
        options: import("better-auth/plugins").PhoneNumberOptions | undefined;
        $ERROR_CODES: {
            readonly INVALID_PHONE_NUMBER: "Invalid phone number";
            readonly PHONE_NUMBER_EXIST: "Phone number already exists";
            readonly PHONE_NUMBER_NOT_EXIST: "phone number isn't registered";
            readonly INVALID_PHONE_NUMBER_OR_PASSWORD: "Invalid phone number or password";
            readonly UNEXPECTED_ERROR: "Unexpected error";
            readonly OTP_NOT_FOUND: "OTP not found";
            readonly OTP_EXPIRED: "OTP expired";
            readonly INVALID_OTP: "Invalid OTP";
            readonly PHONE_NUMBER_NOT_VERIFIED: "Phone number not verified";
            readonly PHONE_NUMBER_CANNOT_BE_UPDATED: "Phone number cannot be updated";
            readonly SEND_OTP_NOT_IMPLEMENTED: "sendOTP not implemented";
            readonly TOO_MANY_ATTEMPTS: "Too many attempts";
        };
    }, {
        id: "organization";
        endpoints: import("better-auth/plugins").OrganizationEndpoints<import("better-auth/plugins").OrganizationOptions & {
            teams: {
                enabled: true;
            };
            dynamicAccessControl?: {
                enabled?: false | undefined;
            } | undefined;
        }> & import("better-auth/plugins").TeamEndpoints<import("better-auth/plugins").OrganizationOptions & {
            teams: {
                enabled: true;
            };
            dynamicAccessControl?: {
                enabled?: false | undefined;
            } | undefined;
        }>;
        schema: import("better-auth/plugins").OrganizationSchema<import("better-auth/plugins").OrganizationOptions & {
            teams: {
                enabled: true;
            };
            dynamicAccessControl?: {
                enabled?: false | undefined;
            } | undefined;
        }>;
        $Infer: {
            Organization: {
                id: string;
                name: string;
                slug: string;
                createdAt: Date;
                logo?: string | null | undefined;
                metadata?: any;
            };
            Invitation: {
                id: string;
                organizationId: string;
                email: string;
                role: "admin" | "member" | "owner";
                status: import("better-auth/plugins").InvitationStatus;
                inviterId: string;
                expiresAt: Date;
                createdAt: Date;
                teamId?: string | undefined | undefined;
            };
            Member: {
                id: string;
                organizationId: string;
                role: "admin" | "member" | "owner";
                createdAt: Date;
                userId: string;
                teamId?: string | undefined | undefined;
                user: {
                    id: string;
                    email: string;
                    name: string;
                    image?: string | undefined;
                };
            };
            Team: {
                id: string;
                name: string;
                organizationId: string;
                createdAt: Date;
                updatedAt?: Date | undefined;
            };
            TeamMember: {
                id: string;
                teamId: string;
                userId: string;
                createdAt: Date;
            };
            ActiveOrganization: {
                members: {
                    id: string;
                    organizationId: string;
                    role: "admin" | "member" | "owner";
                    createdAt: Date;
                    userId: string;
                    teamId?: string | undefined | undefined;
                    user: {
                        id: string;
                        email: string;
                        name: string;
                        image?: string | undefined;
                    };
                }[];
                invitations: {
                    id: string;
                    organizationId: string;
                    email: string;
                    role: "admin" | "member" | "owner";
                    status: import("better-auth/plugins").InvitationStatus;
                    inviterId: string;
                    expiresAt: Date;
                    createdAt: Date;
                    teamId?: string | undefined | undefined;
                }[];
                teams: {
                    id: string;
                    name: string;
                    organizationId: string;
                    createdAt: Date;
                    updatedAt?: Date | undefined;
                }[];
            } & {
                id: string;
                name: string;
                slug: string;
                createdAt: Date;
                logo?: string | null | undefined;
                metadata?: any;
            };
        };
        $ERROR_CODES: {
            readonly YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_ORGANIZATION: "You are not allowed to create a new organization";
            readonly YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_ORGANIZATIONS: "You have reached the maximum number of organizations";
            readonly ORGANIZATION_ALREADY_EXISTS: "Organization already exists";
            readonly ORGANIZATION_SLUG_ALREADY_TAKEN: "Organization slug already taken";
            readonly ORGANIZATION_NOT_FOUND: "Organization not found";
            readonly USER_IS_NOT_A_MEMBER_OF_THE_ORGANIZATION: "User is not a member of the organization";
            readonly YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_ORGANIZATION: "You are not allowed to update this organization";
            readonly YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_ORGANIZATION: "You are not allowed to delete this organization";
            readonly NO_ACTIVE_ORGANIZATION: "No active organization";
            readonly USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION: "User is already a member of this organization";
            readonly MEMBER_NOT_FOUND: "Member not found";
            readonly ROLE_NOT_FOUND: "Role not found";
            readonly YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_TEAM: "You are not allowed to create a new team";
            readonly TEAM_ALREADY_EXISTS: "Team already exists";
            readonly TEAM_NOT_FOUND: "Team not found";
            readonly YOU_CANNOT_LEAVE_THE_ORGANIZATION_AS_THE_ONLY_OWNER: "You cannot leave the organization as the only owner";
            readonly YOU_CANNOT_LEAVE_THE_ORGANIZATION_WITHOUT_AN_OWNER: "You cannot leave the organization without an owner";
            readonly YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_MEMBER: "You are not allowed to delete this member";
            readonly YOU_ARE_NOT_ALLOWED_TO_INVITE_USERS_TO_THIS_ORGANIZATION: "You are not allowed to invite users to this organization";
            readonly USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION: "User is already invited to this organization";
            readonly INVITATION_NOT_FOUND: "Invitation not found";
            readonly YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION: "You are not the recipient of the invitation";
            readonly EMAIL_VERIFICATION_REQUIRED_BEFORE_ACCEPTING_OR_REJECTING_INVITATION: "Email verification required before accepting or rejecting invitation";
            readonly YOU_ARE_NOT_ALLOWED_TO_CANCEL_THIS_INVITATION: "You are not allowed to cancel this invitation";
            readonly INVITER_IS_NO_LONGER_A_MEMBER_OF_THE_ORGANIZATION: "Inviter is no longer a member of the organization";
            readonly YOU_ARE_NOT_ALLOWED_TO_INVITE_USER_WITH_THIS_ROLE: "You are not allowed to invite a user with this role";
            readonly FAILED_TO_RETRIEVE_INVITATION: "Failed to retrieve invitation";
            readonly YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_TEAMS: "You have reached the maximum number of teams";
            readonly UNABLE_TO_REMOVE_LAST_TEAM: "Unable to remove last team";
            readonly YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_MEMBER: "You are not allowed to update this member";
            readonly ORGANIZATION_MEMBERSHIP_LIMIT_REACHED: "Organization membership limit reached";
            readonly YOU_ARE_NOT_ALLOWED_TO_CREATE_TEAMS_IN_THIS_ORGANIZATION: "You are not allowed to create teams in this organization";
            readonly YOU_ARE_NOT_ALLOWED_TO_DELETE_TEAMS_IN_THIS_ORGANIZATION: "You are not allowed to delete teams in this organization";
            readonly YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_TEAM: "You are not allowed to update this team";
            readonly YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_TEAM: "You are not allowed to delete this team";
            readonly INVITATION_LIMIT_REACHED: "Invitation limit reached";
            readonly TEAM_MEMBER_LIMIT_REACHED: "Team member limit reached";
            readonly USER_IS_NOT_A_MEMBER_OF_THE_TEAM: "User is not a member of the team";
            readonly YOU_CAN_NOT_ACCESS_THE_MEMBERS_OF_THIS_TEAM: "You are not allowed to list the members of this team";
            readonly YOU_DO_NOT_HAVE_AN_ACTIVE_TEAM: "You do not have an active team";
            readonly YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_TEAM_MEMBER: "You are not allowed to create a new member";
            readonly YOU_ARE_NOT_ALLOWED_TO_REMOVE_A_TEAM_MEMBER: "You are not allowed to remove a team member";
            readonly YOU_ARE_NOT_ALLOWED_TO_ACCESS_THIS_ORGANIZATION: "You are not allowed to access this organization as an owner";
            readonly YOU_ARE_NOT_A_MEMBER_OF_THIS_ORGANIZATION: "You are not a member of this organization";
            readonly MISSING_AC_INSTANCE: "Dynamic Access Control requires a pre-defined ac instance on the server auth plugin. Read server logs for more information";
            readonly YOU_MUST_BE_IN_AN_ORGANIZATION_TO_CREATE_A_ROLE: "You must be in an organization to create a role";
            readonly YOU_ARE_NOT_ALLOWED_TO_CREATE_A_ROLE: "You are not allowed to create a role";
            readonly YOU_ARE_NOT_ALLOWED_TO_UPDATE_A_ROLE: "You are not allowed to update a role";
            readonly YOU_ARE_NOT_ALLOWED_TO_DELETE_A_ROLE: "You are not allowed to delete a role";
            readonly YOU_ARE_NOT_ALLOWED_TO_READ_A_ROLE: "You are not allowed to read a role";
            readonly YOU_ARE_NOT_ALLOWED_TO_LIST_A_ROLE: "You are not allowed to list a role";
            readonly YOU_ARE_NOT_ALLOWED_TO_GET_A_ROLE: "You are not allowed to get a role";
            readonly TOO_MANY_ROLES: "This organization has too many roles";
            readonly INVALID_RESOURCE: "The provided permission includes an invalid resource";
            readonly ROLE_NAME_IS_ALREADY_TAKEN: "That role name is already taken";
            readonly CANNOT_DELETE_A_PRE_DEFINED_ROLE: "Cannot delete a pre-defined role";
            readonly ROLE_IS_ASSIGNED_TO_MEMBERS: "Cannot delete a role that is assigned to members. Please reassign the members to a different role first";
        };
        options: NoInfer<import("better-auth/plugins").OrganizationOptions & {
            teams: {
                enabled: true;
            };
            dynamicAccessControl?: {
                enabled?: false | undefined;
            } | undefined;
        }>;
    }];
    user: {
        additionalFields: {
            userMetadata: {
                type: "json";
                required: false;
                input: false;
            };
            appMetadata: {
                type: "json";
                required: false;
                input: false;
            };
            invitedAt: {
                type: "date";
                required: false;
                input: false;
            };
            lastSignInAt: {
                type: "date";
                required: false;
                input: false;
            };
        };
    };
    session: {
        expiresIn: number;
        updateAge: number;
    };
    databaseHooks: {
        user: {
            create: {
                after: (user: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string;
                    emailVerified: boolean;
                    name: string;
                    image?: string | null | undefined;
                } & Record<string, unknown>) => Promise<void>;
            };
        };
    };
    trustedOrigins: string[];
}>;
//# sourceMappingURL=auth.d.ts.map