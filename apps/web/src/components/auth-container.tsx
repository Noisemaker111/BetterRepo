import { useState } from "react";
import SignInForm from "./sign-in-form";
import SignUpForm from "./sign-up-form";

export function AuthContainer() {
    const [showSignUp, setShowSignUp] = useState(false);

    return (
        <div className="max-w-md mx-auto mt-20">
            {showSignUp ? (
                <SignUpForm onSwitchToSignIn={() => setShowSignUp(false)} />
            ) : (
                <SignInForm onSwitchToSignUp={() => setShowSignUp(true)} />
            )}
        </div>
    );
}
