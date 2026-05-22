import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Set initial value immediately without effect if possible, but we wait for mount
    const timer = setTimeout(() => setIsMobile(mql.matches), 0)
    
    const onChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }
    mql.addEventListener("change", onChange)
    
    return () => {
      clearTimeout(timer)
      mql.removeEventListener("change", onChange)
    }
  }, [])

  return !!isMobile
}
