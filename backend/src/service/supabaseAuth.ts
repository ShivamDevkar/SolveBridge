import supabase from "../config/supabase";

async function getAuthenticatedUser(accessToken: string) {
    const {data: {user}, error} = await supabase.auth.getUser(accessToken);

    if(error || !user) {
        throw new Error("Invalid or expired access token");
    }

    return user;
}

export default getAuthenticatedUser;