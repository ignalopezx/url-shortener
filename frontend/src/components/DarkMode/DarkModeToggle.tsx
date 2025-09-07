"use client"

import { useState, useEffect } from "react"

export default function DarkModeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark"
    }
    return false
  })

  useEffect(() => {
    const htmlElement = document.documentElement

    if (dark) {
      htmlElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      htmlElement.classList.remove("dark")
      localStorage.removeItem("theme")
    }
  }, [dark])

  const toggleDarkMode = () => {
    setDark(!dark)
  }

  return (
    <button
      onClick={toggleDarkMode}
      className="px-3 py-1 rounded-md border shadow text-sm transition bg-white dark:bg-gray-800 text-slate-700 dark:text-white border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
    >
      {dark ? "☀️ Claro" : "🌙 Oscuro"}
    </button>
  )
}
