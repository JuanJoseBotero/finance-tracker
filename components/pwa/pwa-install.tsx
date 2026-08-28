"use client"

import { useEffect, useState } from "react"
import { Download, Share, SquarePlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const DISMISS_KEY = "finanza-pwa-install-dismissed"

function isIos() {
  if (typeof navigator === "undefined") return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone() {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari-specific flag
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

export function PwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIosHint, setShowIosHint] = useState(false)
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.log("[v0] Service worker registration failed:", error)
      })
    }

    setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1")

    if (isStandalone()) return

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    if (isIos()) {
      setShowIosHint(true)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    window.localStorage.setItem(DISMISS_KEY, "1")
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted" || outcome === "dismissed") {
      setDeferredPrompt(null)
      handleDismiss()
    }
  }

  if (dismissed || (!deferredPrompt && !showIosHint)) return null

  return (
    <div
      role="region"
      aria-label="Instalar aplicación"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-lg sm:inset-x-auto sm:right-6 sm:left-auto"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {deferredPrompt ? (
          <Download className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Share className="h-5 w-5" aria-hidden="true" />
        )}
      </span>

      <div className="flex-1 space-y-2">
        <p className="text-sm font-medium leading-tight">Instala Finanza en tu dispositivo</p>

        {deferredPrompt ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            Accede más rápido y úsala sin conexión desde tu pantalla de inicio.
          </p>
        ) : (
          <p className="text-xs leading-relaxed text-muted-foreground">
            Toca <Share className="mx-0.5 inline h-3.5 w-3.5 align-text-bottom" aria-hidden="true" /> Compartir y luego{" "}
            <SquarePlus className="mx-0.5 inline h-3.5 w-3.5 align-text-bottom" aria-hidden="true" /> &quot;Agregar a
            pantalla de inicio&quot;.
          </p>
        )}

        {deferredPrompt && (
          <Button size="sm" onClick={handleInstall} className="mt-1">
            Instalar app
          </Button>
        )}
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Cerrar aviso de instalación"
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
