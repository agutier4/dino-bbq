import { Box, Text, Container, HStack, Wrap, WrapItem } from '@chakra-ui/react';
import { useContext } from 'react';
import DinoContext from '../context/DinoContext';
import NodeCard from './NodeCard';

function RootScreen() {
    const { nodes } = useContext(DinoContext);

    return (
        <Box
            p="20px"
            display="flex"
            flexDir="column"
            justifyContent="stretch"
            alignItems="stretch"
            flex="1"
            bg="rgba(0,0,0,0.05)"
        >
            <Container maxWidth="600px">
                <Wrap spacing={1}>
                    {nodes.map((node) => (
                        <WrapItem>
                            <NodeCard node={node} />
                        </WrapItem>
                    ))}
                </Wrap>
            </Container>
            <Box flex="1"></Box>
        </Box>
    );
}

export default RootScreen;
