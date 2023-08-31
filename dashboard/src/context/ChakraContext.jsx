import { extendTheme } from '@chakra-ui/react';
import { ChakraProvider } from '@chakra-ui/react';

const theme = extendTheme({
    fonts: {
        heading: `Inter, serif`,
        body: `Inter, serif`,
    },
    styles: {
        global: {
            'html, body': {},
        },
    },
    components: {
        Button: {
            baseStyle: {
                borderRadius: '0px',
            },
            variants: {
                black: {
                    bg: 'rgba(0,0,0,0.9)',
                    color: 'white',
                    height: '40px',
                    borderRadius: '0px',
                    _hover: {
                        bg: 'rgba(0,0,0,95)',
                        _disabled: {
                            bg: 'rgba(0,0,0,85)',
                        },
                    },
                    _active: {
                        bg: 'rgba(0,0,0,1.0)',
                    },
                    _disabled: {
                        bg: 'rgba(0,0,0,1.0)',
                    },
                },
            },
        },
        Modal: {
            baseStyle: {
                modal: {
                    borderRadius: '0px',
                },
            },
        },
    },
    initialColorMode: 'light',
    useSystemColorMode: false,
});

const ChakraContextProvider = ({ children }) => {
    return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
};

export default ChakraContextProvider;
