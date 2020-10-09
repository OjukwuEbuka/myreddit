import { ThemeProvider, CSSReset, ColorModeProvider } from '@chakra-ui/core'

import theme from '../theme'

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
        <CSSReset />
        <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default MyApp
