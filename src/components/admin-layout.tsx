// File: /src/components/admin-layout.tsx
// Description: FINAL. Adds a new link to the "Branches" page in the sidebar navigation.
// This is the missing piece from the previous step.

"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Package2Icon,
  SearchIcon,
  LayoutDashboardIcon,
  BuildingIcon, // Icon for Branches
  PackageIcon,
  ShoppingCartIcon,
  UsersIcon,
} from "lucide-react";

// Add new page to the mapping
const pageNames: { [key: string]: string } = {
  "/admin": "Dashboard",
  "/admin/branches": "Branches", // NEW
  "/admin/customers": "Customers",
  "/admin/products": "Products",
  "/admin/orders": "Orders",
  "/admin/pos": "Point of Sale",
};

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="#"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Package2Icon className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">Corelytix</span>
          </Link>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin"
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    pathname === "/admin"
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  } transition-colors hover:text-foreground md:h-8 md:w-8`}
                >
                  <LayoutDashboardIcon className="h-5 w-5" />
                  <span className="sr-only">Dashboard</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Dashboard</TooltipContent>
            </Tooltip>
            {/* NEW Branch Link */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin/branches"
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    pathname === "/admin/branches"
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  } transition-colors hover:text-foreground md:h-8 md:w-8`}
                >
                  <BuildingIcon className="h-5 w-5" />
                  <span className="sr-only">Branches</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Branches</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin/products"
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    pathname === "/admin/products"
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  } transition-colors hover:text-foreground md:h-8 md:w-8`}
                >
                  <PackageIcon className="h-5 w-5" />
                  <span className="sr-only">Products</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Products</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin/customers"
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    pathname === "/admin/customers"
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  } transition-colors hover:text-foreground md:h-8 md:w-8`}
                >
                  <UsersIcon className="h-5 w-5" />
                  <span className="sr-only">Customers</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Customers</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/orders"
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    pathname.startsWith("/orders")
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  } transition-colors hover:text-foreground md:h-8 md:w-8`}
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  <span className="sr-only">POS</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Point of Sale</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>
      <div className="flex flex-col sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
           <h1 className="text-xl font-semibold">{pageNames[pathname] || 'Admin'}</h1>
            <div className="relative ml-auto flex-1 md:grow-0">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                />
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="overflow-hidden rounded-full"
                    >
                        <Image
                            src="/placeholder-user.jpg"
                            width={36}
                            height={36}
                            alt="Avatar"
                            className="overflow-hidden rounded-full"
                        />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem>Support</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
        </main>
      </div>
    </div>
  );
}
