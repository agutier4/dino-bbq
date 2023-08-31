import React, { useEffect, useRef, useState } from 'react';
import { useLocalStorage } from 'react-use';
import axios from 'axios';
import { useInterval } from 'react-use';
import { useToast, Box } from '@chakra-ui/react';

const DinoContext = React.createContext(null);
export default DinoContext;

export function DinoContextProvider({ children }) {
    const [nodes, setNodes] = useLocalStorage('nodes', []);
    const toast = useToast();

    const hostname = window.location.hostname;
    console.log(hostname);

    const fetchNodes = async () => {
        console.log('fetching nodes...');
        const result = await axios.get(`http://${hostname}:3000/api/nodes/status`);
        console.log(result.data);
        setNodes(result.data);
    };

    const sendRoarCommand = async (id) => {
        console.log('sending roar command...');
        try {
            const result = await axios.post(`http://${hostname}:3000/api/roar/` + id);
            toast({
                title: `Sent roar command for node ${id}`,
                position: 'bottom',
                isClosable: true,
                duration: 1000,
                render: () => (
                    <Box
                        color="black"
                        fontSize="16px"
                        fontWeight="500"
                        p={3}
                        borderRadius="0px"
                        pointerEvents="none"
                        userSelect="none"
                        bg="rgb(255,255,255,0.8)"
                        border="1px solid rgba(0,0,0,0.1)"
                    >
                        Sent roar command to node {id}!
                    </Box>
                ),
            });
        } catch (e) {
            toast({
                title: `Failed to send roar command for node ${id}`,
                position: 'bottom',
                isClosable: true,
                duration: 1000,
                render: () => (
                    <Box
                        color="black"
                        fontSize="16px"
                        fontWeight="500"
                        p={3}
                        borderRadius="0px"
                        pointerEvents="none"
                        userSelect="none"
                        bg="rgb(255,100,100,0.5)"
                        border="1px solid rgba(0,0,0,0.1)"
                    >
                        Failed to send roar command to node {id}!
                    </Box>
                ),
            });
        }
    };

    const interval = useRef(null);
    useEffect(() => {
        interval.current = setInterval(() => {
            fetchNodes();
        }, 1000);

        return () => {
            clearInterval(interval.current);
        };
    }, []);

    return (
        <DinoContext.Provider
            value={{
                nodes: nodes,
                sendRoarCommand: sendRoarCommand,
            }}
        >
            {children}
        </DinoContext.Provider>
    );
}
