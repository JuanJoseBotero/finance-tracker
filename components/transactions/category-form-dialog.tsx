"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Tag } from "lucide-react"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createCategory } from "@/app/actions/categories"

export function CategoryFormDialog() {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [name, setName] = useState("")
  const [kind, setKind] = useState<"expense" | "income">("expense")
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Ingresa un nombre de categoría")
      return
    }
    startTransition(async () => {
      try {
        await createCategory({ name, kind, icon: "circle" })
        toast.success("Categoría creada")
        setName("")
        setOpen(false)
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo crear la categoría")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="gap-2">
            <Tag className="h-4 w-4" aria-hidden="true" />
            Nueva categoría
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Nueva categoría</DialogTitle>
          <DialogDescription>Crea una categoría personalizada para tus movimientos.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="category-name">Nombre</Label>
            <Input
              id="category-name"
              placeholder="Ej. Mascotas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Tipo</Label>
            <Tabs value={kind} onValueChange={(v) => setKind(v as "expense" | "income")}>
              <TabsList className="w-full">
                <TabsTrigger value="expense" className="flex-1">
                  Gasto
                </TabsTrigger>
                <TabsTrigger value="income" className="flex-1">
                  Ingreso
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Creando..." : "Crear categoría"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
