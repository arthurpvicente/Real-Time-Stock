'use server';

import {auth} from "@/lib/better-auth/auth";
import {inngest} from "@/lib/inngest/client";
import {headers} from "next/headers";

export const signUpWithEmail = async ({ email, password, fullName, country, investmentGoals, riskTolerance, preferredIndustry, image }: SignUpFormData) => {
    try {
        const response = await auth.api.signUpEmail({ body: { email, password, name: fullName, image: image || null } })

        if(response) {
            try {
                await inngest.send({
                    name: 'app/user.created',
                    data: { email, name: fullName, country, investmentGoals, riskTolerance, preferredIndustry }
                })
            } catch (inngestError) {
                // Welcome email failure should not block sign-up
                console.error('Failed to send sign-up event to Inngest:', inngestError)
            }
        }

        return { success: true, data: response }
    } catch (e) {
        console.error('Sign up failed', e)
        const message = e instanceof Error ? e.message : 'Sign up failed';
        return { success: false, error: message }
    }
}

export const signInWithEmail = async ({ email, password }: SignInFormData) => {
    try {
        const response = await auth.api.signInEmail({ body: { email, password } })

        return { success: true, data: response }
    } catch (e) {
        console.error('Sign in failed', e)
        const message = e instanceof Error ? e.message : 'Sign in failed';
        return { success: false, error: message }
    }
}

export const updateUserImage = async (imageUrl: string) => {
    try {
        await auth.api.updateUser({ body: { image: imageUrl }, headers: await headers() });
        return { success: true };
    } catch (e) {
        console.error('Update image failed', e);
        return { success: false, error: e instanceof Error ? e.message : 'Failed to update image' };
    }
}

export const signOut = async () => {
    try {
        await auth.api.signOut({ headers: await headers() });
        return { success: true }
    } catch (e) {
        console.error('Sign out failed', e)
        return { success: false, error: 'Sign out failed' }
    }
}
