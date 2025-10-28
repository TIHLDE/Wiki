'use client'
import { type ReactNode } from 'react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './collapsible'
import { Button } from './Button'
import { ChevronDownIcon } from './icons/ChevronDownIcon'
import { ChevronRightIcon } from './icons/ChevronRightIcon'
import { useState } from 'react'
import { cn } from '@/lib/utils'

type ExpandableProps = {
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  children: ReactNode
  extra?: ReactNode
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Expandable = ({
  title,
  description,
  icon,
  extra,
  children,
  className,
  open,
  onOpenChange,
}: ExpandableProps) => {
  const [expanded, setExpanded] = useState<boolean>(false)

  return (
    <Collapsible
      className={cn(
        'border-secondary my-3 w-full rounded-md border bg-white dark:bg-inherit',
        className,
      )}
      onOpenChange={onOpenChange || setExpanded}
      open={open || expanded}
    >
      <CollapsibleTrigger asChild>
        <Button
          className={cn(
            'dark:hover:bg-secondary flex w-full items-center justify-between whitespace-normal rounded-sm rounded-b-none rounded-t-md border-none bg-white py-2 dark:bg-inherit',
            expanded && 'rounded-b-none',
          )}
          variant="outline"
        >
          <div className="flex w-full items-center space-x-2 overflow-hidden md:space-x-4">
            {icon}
            <div className="break-words text-start">
              {typeof title === 'string' ? (
                <h1 className="text-sm md:text-base">{title}</h1>
              ) : (
                title
              )}
              {typeof description === 'string' ? (
                <h1 className="text-xs md:text-sm">{description}</h1>
              ) : (
                description
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {extra}
            {expanded || open ? (
              <ChevronDownIcon className="stroke-[1.5px]" />
            ) : (
              <ChevronRightIcon className="stroke-[1.5px]" />
            )}
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t-secondary border border-x-0 border-b-0 *:m-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

export default Expandable
