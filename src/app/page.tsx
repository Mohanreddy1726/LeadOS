"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Errors {
  email?: string;
  password?: string;
}

export default function AuthPage() {
  const router = useRouter();
  const { signIn, user, hydrated } = useStore();
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (hydrated && user) router.push("/dashboard");
  }, [hydrated, user, router]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function validate() {
    const e: Errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email";
    if (form.password.length < 8) e.password = "Use at least 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    try {
      const res = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      signIn(data.user, data.token);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    }
  }

  const inputCls = (bad?: string) =>
    cn(
      "h-10 w-full rounded-xl border bg-surface px-3 text-[13px] outline-none transition-colors placeholder:text-faint focus:border-primary",
      bad ? "border-destructive" : "border-border",
    );

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Brand side */}
      <section className="relative hidden flex-col justify-between bg-foreground p-10 text-background lg:flex">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-primary">
            <span className="font-display text-base font-semibold text-primary-foreground">V</span>
          </div>
          <div>
            <div className="font-display text-[16px] font-semibold leading-none">Lead.OS</div>
            <div className="font-mono mt-1 text-[9px] tracking-[0.16em] uppercase opacity-60">
              Lead OS
            </div>
          </div>
        </div>

        <div className="max-w-md">
          <h1 className="font-display text-[34px] leading-tight font-semibold text-balance">
            Every lead, from the first ad click to the deposit.
          </h1>
          <p className="mt-4 text-[13px] leading-relaxed opacity-70">
            Lead.OS ingests leads from Meta, Google, your website and WhatsApp, calls them with
            AI, filters the junk, scores intent, and hands the real ones to your counsellors.
          </p>
        </div>

        <div className="font-mono text-[10px] opacity-50">
          Enterprise Workspace · Secure Access
        </div>
      </section>

      {/* Form side */}
      <section className="flex items-center justify-center bg-background px-5 py-10">
        <div className="clay w-full max-w-[440px] p-6 sm:p-8">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="grid size-9 place-items-center rounded-xl bg-primary">
              <span className="font-display text-sm font-semibold text-primary-foreground">V</span>
            </div>
            <span className="font-display text-[15px] font-semibold">Lead.OS</span>
          </div>

          <h2 className="font-display text-[19px] font-semibold tracking-tight mt-4 mb-1">
            Welcome back
          </h2>
          <p className="mb-5 text-[12px] text-muted-foreground">
            Enter your credentials to access your workspace.
          </p>

          <form onSubmit={submit} className="space-y-3.5" noValidate>
            <Field label="Work email" error={errors.email}>
              <input
                type="email"
                className={inputCls(errors.email)}
                value={form.email}
                onChange={set("email")}
                autoComplete="email"
              />
            </Field>

            <Field label="Password" error={errors.password}>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  className={cn(inputCls(errors.password), "pr-10")}
                  value={form.password}
                  onChange={set("password")}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>

            <div className="flex items-center justify-between pt-1">
              <label className="flex cursor-pointer items-center gap-2 text-[12px] text-muted-foreground">
                <input
                  type="checkbox"
                  checked={true}
                  readOnly
                  className="size-3.5 accent-[var(--primary)]"
                />
                Remember me
              </label>
              <div className="text-[12px] font-medium text-primary hover:underline cursor-pointer">
                Forgot password?
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 h-11 w-full rounded-xl bg-primary text-[13px] font-medium text-primary-foreground shadow-[var(--shadow-bubble)] transition-transform hover:-translate-y-0.5"
            >
              Log in
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-[11px] text-destructive">{error}</span> : null}
    </label>
  );
}
