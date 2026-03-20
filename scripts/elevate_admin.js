import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function elevateAdmin() {
    const email = 'zuxian7797@gmail.com';
    console.log(`Elevating ${email} to admin...`);

    // 1. Get User ID from auth.users (requires service role)
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
        console.error("Error fetching users:", userError);
        return;
    }

    const user = userData.users.find(u => u.email === email);
    if (!user) {
        console.log(`User ${email} not found. Please log in first via /login`);
        return;
    }

    // 2. Update profiles table
    const { data, error } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', user.id);

    if (error) {
        console.error("Error updating profile:", error);
    } else {
        console.log(`Successfully elevated ${email} (ID: ${user.id}) to ADMIN.`);
    }
}

elevateAdmin();
