"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { loginWithPassword, persistOAuthHashSession, signInWithGoogle } from "@/lib/qr-api"
import { ArrowRight, Chrome, Copy, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("admin@ets.co.id")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    persistOAuthHashSession()
      .then((stored) => {
        if (stored) router.replace("/admin")
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Login Google gagal."))
  }, [router])

  const submit = async () => {
    if (!email.trim() || !password) {
      toast.error("Email dan password wajib diisi.")
      return
    }
    try {
      setLoading(true)
      await loginWithPassword(email.trim(), password)
      toast.success("Login berhasil.")
      router.replace("/admin")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Email atau password salah.")
    } finally {
      setLoading(false)
    }
  }

  const copyDemo = async (value: string) => {
    await navigator.clipboard.writeText(value)
    toast.success("Disalin.")
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <Link href="/" className="mb-6 inline-flex text-sm text-muted-foreground hover:text-foreground">
          ← Beranda
        </Link>
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <img src="https://qr.zanxa.studio/assets/ets-logo.png" alt="ETS" className="mb-3 h-10 object-contain" />
                  <h1 className="text-2xl font-bold">Masuk ke Admin Panel</h1>
                  <p className="text-balance text-muted-foreground">ETS Industrial Asset Tracking</p>
                </div>

                <div className="grid gap-3">
                  <Button variant="outline" className="w-full" onClick={() => signInWithGoogle()}>
                    <Chrome data-icon="inline-start" />
                    Login dengan Google
                  </Button>
                  <div className="flex items-center gap-3">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground">atau</span>
                    <Separator className="flex-1" />
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        onKeyDown={(event) => event.key === "Enter" && submit()}
                        autoComplete="current-password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0"
                        onClick={() => setShowPassword((value) => !value)}
                      >
                        {showPassword ? <EyeOff data-icon="inline-start" /> : <Eye data-icon="inline-start" />}
                      </Button>
                    </div>
                  </div>
                  <Button onClick={submit} disabled={loading} className="w-full">
                    {loading ? <Spinner /> : <ArrowRight data-icon="inline-start" />}
                    Masuk
                  </Button>
                </div>

                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">
                  <div className="mb-2 font-semibold text-destructive">Demo Credentials</div>
                  <div className="flex items-center justify-between gap-2 font-mono text-xs">
                    <span>admin@ets.co.id</span>
                    <Button variant="ghost" size="icon" onClick={() => copyDemo("admin@ets.co.id")}>
                      <Copy data-icon="inline-start" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between gap-2 font-mono text-xs">
                    <span>Admin123!</span>
                    <Button variant="ghost" size="icon" onClick={() => copyDemo("Admin123!")}>
                      <Copy data-icon="inline-start" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative hidden bg-muted md:block">
              <img
                src="https://qr.zanxa.studio/assets/Logo%20ETS%20full.png"
                alt="ETS industrial"
                className="absolute inset-0 size-full object-contain p-12"
              />
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 text-center text-xs text-muted-foreground">© 2026 ETS - Industrial Asset Tracking</div>
      </div>
    </div>
  )
}
