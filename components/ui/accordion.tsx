import * as React from 'react'

type AccordionProps = React.HTMLAttributes<HTMLDivElement>

export function Accordion({ className, children, ...props }: AccordionProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

type AccordionItemProps = React.DetailsHTMLAttributes<HTMLDetailsElement>

export function AccordionItem({ className, children, ...props }: AccordionItemProps) {
  return (
    <details className={className} {...props}>
      {children}
    </details>
  )
}

type AccordionTriggerProps = React.HTMLAttributes<HTMLElement> & { asChild?: boolean }

export function AccordionTrigger({ className, children, ...props }: AccordionTriggerProps) {
  return (
    <summary
      className={
        'cursor-pointer list-none select-none rounded-md border p-3 text-sm font-medium hover:bg-muted/50 ' +
        (className || '')
      }
      {...props}
    >
      {children}
    </summary>
  )
}

type AccordionContentProps = React.HTMLAttributes<HTMLDivElement>

export function AccordionContent({ className, children, ...props }: AccordionContentProps) {
  return (
    <div className={'mt-3 space-y-3 ' + (className || '')} {...props}>
      {children}
    </div>
  )
}


