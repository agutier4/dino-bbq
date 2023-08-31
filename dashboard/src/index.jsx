import React from 'react';
import ReactDOM from 'react-dom';
import './assets/css/index.scss';
import './assets/css/fonts.scss';
import 'focus-visible/dist/focus-visible';
import ChakraContextProvider from './context/ChakraContext';
import { DinoContextProvider } from './context/DinoContext';
import Root from './components/Root';

ReactDOM.render(
    <ChakraContextProvider>
        <DinoContextProvider>
            <Root />
        </DinoContextProvider>
    </ChakraContextProvider>,
    document.getElementById('root')
);
