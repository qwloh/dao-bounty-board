import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { IconButton, IconButtonClasses } from './IconButton';
import { Logo } from './Icons/Logo';
import { ThemeIconDark } from './Icons/ThemeIconDark';
import { ThemeIconLight } from './Icons/ThemeIconLight';

const delayMountThemeButton = 1000
export function Header() {
  const { theme, setTheme } = useTheme()
  const [themeButtonVisible, setThemeButtonVisible] = useState(false)
  const [scrolledPastHeader, setScrollPastHeader] = useState(false)

  const scrolled = scrolledPastHeader

  function toggleTheme() {
    if (theme === 'light') {
      setTheme('dark')
    } else {
      setTheme('light')
    }
  }

  useEffect(() => {
    setTimeout(() => {
      setThemeButtonVisible(true)
    }, delayMountThemeButton)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50 && !scrolledPastHeader) {
        setScrollPastHeader(true)
      }
      if (window.scrollY <= 50 && scrolledPastHeader) {
        setScrollPastHeader(false)
      }
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [scrolledPastHeader])

  return (
    <header
      className={`z-20 sticky top-0 backdrop-blur w-full transition-all bg-slate-100 dark:bg-night-700/50`}
    >
      <div className="max-w-screen-xl mx-auto">
        <div className="px-4 h-14 flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="mr-auto text-2xl">
              <Link href="/" passHref>
                <a>
                  <Logo />
                </a>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {themeButtonVisible && (
                <IconButton onClick={toggleTheme}>
                  {theme === 'dark' ? <ThemeIconLight /> : <ThemeIconDark />}
                </IconButton>
              )}
              <div className="relative">
                <WalletMultiButton
                  className={`${IconButtonClasses} text-sm px-4 w-auto relative text-slate-500 dark:text-slate-400`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
