import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = ({ children, defaultValue, className }) => {
    // Basic implementation
    const [activeTab, setActiveTab] = React.useState(defaultValue);

    // Clone children to pass activeTab and setActiveTab
    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, { activeTab, setActiveTab });
        }
        return child;
    });

    return (
        <div className={cn("", className)}>
            {childrenWithProps}
        </div>
    )
}

const TabsList = React.forwardRef(({ className, activeTab, setActiveTab, children, ...props }, ref) => {
    // Pass activeTab to children (TabsTrigger)
    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, { activeTab, setActiveTab });
        }
        return child;
    });

    return (
        <div
            ref={ref}
            className={cn(
                "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
                className
            )}
            {...props}
        >
            {childrenWithProps}
        </div>
    )
})
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className, value, activeTab, setActiveTab, children, ...props }, ref) => (
    <button
        ref={ref}
        onClick={() => setActiveTab && setActiveTab(value)}
        className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            activeTab === value ? "bg-background text-foreground shadow-sm" : "hover:bg-background/50 hover:text-foreground",
            className
        )}
        {...props}
    >
        {children}
    </button>
))
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className, value, activeTab, children, ...props }, ref) => {
    if (activeTab !== value) return null;
    return (
        <div
            ref={ref}
            className={cn(
                "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
