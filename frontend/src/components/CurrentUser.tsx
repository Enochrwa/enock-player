import { useGetProfileQuery } from "@/features/auth/authApiSlice";
import { ReactNode, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/features/auth/authSlice";
import { User } from "@/services/api";

const CurrentUser = ({ children }: { children: ReactNode }) => {
    const { data, isLoading, isError } = useGetProfileQuery();
    const dispatch = useDispatch();

    useEffect(() => {
        if (data && data.success && data.data) {
            const user = data.data.user as User;
            dispatch(setCredentials({ user, token: "" })); // Token is in cookie, not needed here
        }
    }, [data, dispatch]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError) {
        // This will be the case if the user is not logged in
        // or if there is a network error.
        // We can just render the children and let them handle the auth state.
        return <>{children}</>;
    }

    return <>{children}</>;
};

export default CurrentUser;
