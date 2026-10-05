"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function checkUserPasswordStatus(email: string): Promise<{
    exists: boolean;
    hasPassword: boolean;
}> {
    try {
        const supabaseAdmin = createAdminClient();
        
        // Search for user by email using admin auth API
        const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
        
        if (error) {
            console.error("Error fetching users:", error);
            throw new Error("Failed to check user status");
        }

        const user = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

        if (!user) {
            return { exists: false, hasPassword: false };
        }

        // Call the secure RPC function to check if the user has a password
        const { data: hasPassword, error: queryError } = await supabaseAdmin
            .rpc('check_user_has_password', { user_id: user.id });

        if (queryError) {
             console.error("Error querying check_user_has_password:", queryError);
             return { exists: true, hasPassword: false };
        }

        return {
            exists: true,
            hasPassword: !!hasPassword
        };

    } catch (e) {
        console.error("checkUserPasswordStatus error:", e);
        throw new Error("An error occurred while checking user status");
    }
}
