"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { requestPasswordResetAction } from "./actions";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function RequestResetForm() {
    const t = useTranslations("auth");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        const formData = new FormData(event.currentTarget);

        try {
            const result = await requestPasswordResetAction(formData);
            if (result.error) {
                setError(result.error);
            } else if (result.message) {
                setMessage(result.message);
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>{t("resetPassword")}</CardTitle>
                <CardDescription>{t("resetPasswordDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
                {message ? (
                    <div className="rounded-md bg-green-50 p-4 text-green-800 text-sm mb-4">
                        {message}
                    </div>
                ) : (
                    <form onSubmit={onSubmit} className="space-y-4">
                        {error && (
                            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">{t("email")}</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder={t("emailPlaceholder")}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Sending..." : t("sendResetLink")}
                        </Button>
                    </form>
                )}

                <div className="text-center text-sm mt-4">
                    <Link href="/login" className="text-primary hover:underline">
                        {t("backToLogin")}
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
