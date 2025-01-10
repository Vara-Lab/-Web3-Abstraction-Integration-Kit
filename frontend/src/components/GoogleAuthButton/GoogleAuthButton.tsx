import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "@chakra-ui/react";
import { useSailsCalls } from "@/app/hooks";
import { useDappContext } from "@/Context";
import { useAlert } from "@gear-js/react-hooks";
import axios from "axios";

interface Props {
    onUserIsSignIn?: () => void;
    onSignInSuccess?: (data: GoogleAccountInfo) => void;
    onSignInError?: (error: any) => void;
}

export interface GoogleAccountInfo {
    id:             string;
    email:          string;
    verified_email: boolean;
    name:           string;
    given_name:     string;
    family_name:    string;
    picture:        string;
}

export const GoogleAuthButton = ({ onUserIsSignIn, onSignInError, onSignInSuccess }: Props) => {
    const [userIsSignIn, setUserIsSignIn] = useState(false);
    const login = useGoogleLogin({
        onSuccess: async (codeResponse) => {
            const x = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${codeResponse.access_token}`, {
            headers: {
                Authorization: `Bearer ${codeResponse.access_token}`,
                Accept: 'application/json'
            }
            });

            const data: GoogleAccountInfo = x.data;

            onSignInSuccess && onSignInSuccess(data);
        },
        onError: (error) => {
            onSignInError && onSignInError(error);
            setUserIsSignIn(false);
            console.error('Login Failed:', error);
        },
        onNonOAuthError: (error) => {
            onSignInError && onSignInError(error);
            setUserIsSignIn(false);
            console.log('Non OAuth Error:', error)
        },
    });

    return (
      <Button
        backgroundColor={'blue.400'}
        color={'white'}
        isLoading={userIsSignIn}
        onClick={() => {
            onUserIsSignIn && onUserIsSignIn();
            setUserIsSignIn(true);
            login();
        }}
      >
        Login with Google
    </Button>
    );
}

