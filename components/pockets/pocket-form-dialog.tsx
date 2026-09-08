"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { POCKET_ICONS, getCategoryIcon } from "@/lib/constants"
import { createPocket } from "@/app/actions/pockets"
import { cn } from "@/lib/utils"

export function PocketFormDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [icon, setIcon] = useState("piggy-bank")
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Ingresa un nombre para el bolsillo")
      return
    }

    startTransition(async () => {
      try {
        await createPocket({ name, icon })
        toast.success("Bolsillo creado")
        setName("")
        setIcon("piggy-bank")
        setOpen(false)
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Ocurrió un error")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nuevo bolsillo
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Nuevo bolsillo</DialogTitle>
          <DialogDescription>
            Aparta dinero que ya tienes en tu cuenta para ahorrarlo, sin sacarlo del banco.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="pocket-name">Nombre del bolsillo</Label>
            <Input
              id="pocket-name"
              placeholder="Ej. Fondo de emergencia"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Ícono</Label>
            <div className="flex flex-wrap gap-2">
              {POCKET_ICONS.map((iconName) => {
                const Icon = getCategoryIcon(iconName)
                const selected = icon === iconName
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    aria-pressed={selected}
                    aria-label={`Ícono ${iconName}`}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl border transition-colors",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-transparent text-muted-foreground hover:bg-accent",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </button>
                )
              })}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending} className="gap-2">
              <Plus className="h-4 w-4" aria-hidden="true" />
              {pending ? "Creando..." : "Crear bolsillo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
