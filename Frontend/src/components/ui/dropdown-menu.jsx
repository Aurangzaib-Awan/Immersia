import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownMenu = ({ children }) => <div className="relative inline-block text-left">{children}</div>
const DropdownMenuTrigger = ({ asChild, children }) => asChild ? children : <button>{children}</button>
const DropdownMenuContent = ({ className, children }) => (
    <div className={cn("absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md border bg-popover p-1 shadow-md animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)}>
        {children}
    </div>
)
const DropdownMenuItem = ({ className, children, ...props }) => (
    <div className={cn("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}>
        {children}
    </div>
)
const DropdownMenuLabel = ({ className, children }) => (
    <div className={cn("px-2 py-1.5 text-sm font-semibold", className)}>
        {children}
    </div>
)
const DropdownMenuSeparator = ({ className }) => (
    <div className={cn("-mx-1 my-1 h-px bg-muted", className)} />
)
const DropdownMenuGroup = ({ children }) => <>{children}</>
const DropdownMenuSub = ({ children }) => <>{children}</>
const DropdownMenuSubTrigger = ({ children }) => <div className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent">{children}</div>
const DropdownMenuSubContent = ({ children }) => <div className="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">{children}</div>

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuGroup,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
}
