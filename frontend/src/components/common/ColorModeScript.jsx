import { ColorModeScript as ChakraColorModeScript } from '@chakra-ui/react'
import theme from '../../theme'

export default function ColorModeScript() {
  return <ChakraColorModeScript initialColorMode={theme.config.initialColorMode} />
} 