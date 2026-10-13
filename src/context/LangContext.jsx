import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { LANGUAGES, t } from '../i18n/translations'

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [langCode, setLangCode] = useState('en')

  const activeLang = useMemo(
    () => LANGUAGES.find((l) => l.code === langCode) || LANGUAGES[0],
    [langCode]
  )

  useEffect(() => {
    document.documentElement.dir = activeLang.dir
    document.documentElement.lang = activeLang.code
  }, [activeLang])

  const value = {
    langCode,
    activeLang,
    languages: LANGUAGES,
    setLangCode,
    t: (key) => t(key, langCode),
  }

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LangProvider')
  return ctx
}
