"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type FormState = "idle" | "sending" | "sent" | "error";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("sending");
    setErrorMessage("");

    const { error } = await createClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setErrorMessage(error.message);
      setFormState("error");
      return;
    }
    setFormState("sent");
  }

  return (
    <main className="bg-background flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-lg">Masuk PantauKelas</CardTitle>
          <CardDescription>
            Masukkan email guru untuk menerima tautan login (magic link).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formState === "sent" ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm">
                Cek email <span className="font-medium">{email}</span> untuk
                tautan login.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFormState("idle")}
              >
                Ganti email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <Input
                type="email"
                placeholder="nama@madrasah.sch.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-invalid={formState === "error"}
              />
              {formState === "error" && (
                <p className="text-destructive text-sm">{errorMessage}</p>
              )}
              <Button type="submit" disabled={formState === "sending"}>
                {formState === "sending" ? "Mengirim..." : "Kirim Link Login"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
