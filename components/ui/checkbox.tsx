import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          ref={ref}
          className={cn(
            "h-4 w-4 rounded border border-gray-300 text-blue-600 focus:ring-blue-500",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            className
          )}
          {...props}
        />
        <span className="sr-only">Toggle option</span>
        <span className="pointer-events-none">
          <Check className="h-4 w-4 text-transparent" />
        </span>
      </label>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
