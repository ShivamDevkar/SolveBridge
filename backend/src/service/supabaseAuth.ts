import supabase from "../config/supabase";

async function getAuthenticatedUser(accessToken: string) {
    const {data: {user}, error} = await supabase.auth.getUser(accessToken);

    if(error) {
        throw new Error(`Supabase user validation failed: ${error.message}`);
    }

    if(!user) {
        throw new Error("Supabase returned no authenticated user");
    }
    return user;
}

export default getAuthenticatedUser;