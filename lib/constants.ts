import {
  Utensils,
  Cpu,
  Car,
  HeartPulse,
  Clapperboard,
  Home,
  GraduationCap,
  Shirt,
  PiggyBank,
  MoreHorizontal,
  Wallet,
  Briefcase,
  Gift,
  PlusCircle,
  Circle,
  Landmark,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  Target,
  Plane,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react"

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  cpu: Cpu,
  car: Car,
  "heart-pulse": HeartPulse,
  clapperboard: Clapperboard,
  home: Home,
  "graduation-cap": GraduationCap,
  shirt: Shirt,
  "piggy-bank": PiggyBank,
  "more-horizontal": MoreHorizontal,
  wallet: Wallet,
  briefcase: Briefcase,
  gift: Gift,
  "plus-circle": PlusCircle,
  circle: Circle,
  landmark: Landmark,
  plane: Plane,
  "shopping-bag": ShoppingBag,
  target: Target,
}

export function getCategoryIcon(icon: string): LucideIcon {
  return CATEGORY_ICONS[icon] ?? Circle
}

export const PAYMENT_METHODS = [
  { value: "cash", label: "Efectivo", icon: Banknote },
  { value: "debit", label: "Tarjeta de débito", icon: CreditCard },
  { value: "credit", label: "Tarjeta de crédito", icon: CreditCard },
  { value: "transfer", label: "Transferencia", icon: ArrowRightLeft },
] as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"]

export function getPaymentMethodLabel(value: string) {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value
}

export const GOAL_ICONS = [
  "target",
  "piggy-bank",
  "plane",
  "home",
  "car",
  "graduation-cap",
  "shopping-bag",
  "landmark",
] as const

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
})

export function formatCOP(value: number | string) {
  const num = typeof value === "string" ? Number.parseFloat(value) : value
  return currencyFormatter.format(Number.isFinite(num) ? num : 0)
}

/**
 * Formats a plain "YYYY-MM-DD" calendar date (as stored for transactions,
 * goal deadlines, and contributions) without any timezone conversion.
 * Using `new Date(dateString)` + `toLocaleDateString` shifts the date back
 * a day for users west of UTC, since the string is parsed as UTC midnight
 * and then rendered in the browser's local timezone.
 */
export function formatDate(
  value: string,
  options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" },
) {
  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1))
  return date.toLocaleDateString("es-CO", { ...options, timeZone: "UTC" })
}

export const MONTH_LABELS_ES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
]
