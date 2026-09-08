"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MoreVertical, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCOP, getCategoryIcon } from "@/lib/constants"
import { deletePocket } from "@/app/actions/pockets"
import { PocketMovementDialog } from "./pocket-movement-dialog"

type Pocket = {
  id: number
  name: string
  currentAmount: string
  icon: string
}

export function PocketCard({ pocket }: { pocket: Pocket }) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const Icon = getCategoryIcon(pocket.icon)

  function handleDelete() {
    startTransition(async () => {
      try {
        await deletePocket(pocket.id)
        toast.success("Bolsillo eliminado")
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo eliminar")
      }
    })
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-medium leading-tight">{pocket.name}</p>
              <p className="text-xs text-muted-foreground">Ahorro apartado</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Más acciones">
                  <MoreVertical className="h-4 w-4" aria-hidden="true" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="gap-2 text-destructive focus:text-destructive"
                disabled={pending}
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <span className="font-mono text-2xl font-semibold tracking-tight text-primary">
          {formatCOP(pocket.currentAmount)}
        </span>

        <PocketMovementDialog pocketId={pocket.id} pocketName={pocket.name} />
      </CardContent>
    </Card>
  )
}
