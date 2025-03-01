// "use client"

// import * as React from "react"
// import { Moon, Sun } from "lucide-react"
// import { useTheme } from "next-themes"

// import { Button } from "@/components/ui/button"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"

// export function ModeToggle() {
//   const { setTheme } = useTheme()

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant="outline" size="icon">
//           <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
//           <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
//           <span className="sr-only">Toggle theme</span>
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end">
//         <DropdownMenuItem onClick={() => setTheme("light")}>
//           Light
//         </DropdownMenuItem>
//         <DropdownMenuItem onClick={() => setTheme("dark")}>
//           Dark
//         </DropdownMenuItem>
//         <DropdownMenuItem onClick={() => setTheme("system")}>
//           System
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   )
// }




"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import styles from '@/styles/animation.module.css'

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Ensure theme is correctly applied after hydration
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <label className={styles["themeSwitch"]}>
      <input
        type="checkbox"
        className={styles["themeSwitchCheckbox"]}
        checked={theme === "dark"}
        onChange={(e) => setTheme(e.target.checked ? "dark" : "light")}
      />
      <div className={styles["themeSwitchContainer"]}>
        <div className={styles["themeSwitchClouds"]}></div>
        <div className={styles["themeSwitchStarsContainer"]}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 55" fill="none">
            <path 
              fillRule="evenodd" 
              clipRule="evenodd"
              d="M135.831 3.00688C135.055 3.85027 134.111 4.29946 133 4.35447C134.111 4.40947 135.055 4.85867 135.831 5.71123C136.607 6.55462 136.996 7.56303 136.996 8.72727C136.996 7.95722 137.172 7.25134 137.525 6.59129C137.886 5.93124 138.372 5.39954 138.98 5.00535C139.598 4.60199 140.268 4.39114 141 4.35447C139.88 4.2903 138.936 3.85027 138.16 3.00688C137.384 2.16348 136.996 1.16425 136.996 0C136.996 1.16425 136.607 2.16348 135.831 3.00688Z"
              fill="currentColor">
            </path>
          </svg>
        </div>
        <div className={styles["themeSwitchCircleContainer"]}>
          <div className={styles["themeSwitchSunMoonContainer"]}>
            <div className={styles["themeSwitchMoon"]}>
              <div className={styles["themeSwitchSpot"]}></div>
              <div className={styles["themeSwitchSpot"]}></div>
              <div className={styles["themeSwitchSpot"]}></div>
            </div>
          </div>
        </div>
      </div>
    </label>
  )
}
