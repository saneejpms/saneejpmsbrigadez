"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Users, FileText, Package, DollarSign, Calendar } from "lucide-react"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/clients", icon: Users, label: "Clients" },
  { href: "/dashboard/enquiries", icon: FileText, label: "Enquiries" },
  { href: "/dashboard/materials", icon: Package, label: "Materials" },
  { href: "/dashboard/expenses", icon: DollarSign, label: "Expenses" },
  { href: "/dashboard/schedules", icon: Calendar, label: "Schedules" },
]

export function MobileNavigation() {
  const pathname = usePathname()

  return (
    <nav className="mobile-nav">
      <div className="flex items-center justify-around max-w-7xl mx-auto w-full">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)

          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <div className={`nav-item ${isActive ? "active" : ""}`}>
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
