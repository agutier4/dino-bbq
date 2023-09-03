import { Box, Text, Container, HStack, Wrap, WrapItem, AspectRatio, VStack } from '@chakra-ui/react';
import { useContext } from 'react';
import DinoContext from '../context/DinoContext';
import NodeCard from './NodeCard';

function RoarAll({ node }) {
    const { sendRoarAllCommand } = useContext(DinoContext);
    return (
        <AspectRatio
            ratio={1}
            border="3px solid rgba(0,0,0,0.2)"
            bg="rgba(250,250,250,1.0)"
            minW="150px"
            maxW="200px"
            m="10px"
            cursor="pointer"
            onClick={() => {
                sendRoarAllCommand();
            }}
            transition={'transform 0.2s'}
            _hover={{
                transform: 'scale(1.02)',
            }}
            _active={{
                transform: 'scale(1.05)',
            }}
            display="flex"
            justifyContent="stretch"
            alignItems="stretch"
        >
            <VStack justifyContent="stretch" alignItems="stretch" flex="1">
                <Box>ROAR ALL</Box>
            </VStack>
        </AspectRatio>
    );
}
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
                    <WrapItem>
                        <RoarAll />
                    </WrapItem>
                </Wrap>
            </Container>
            <Box flex="1"></Box>
        </Box>
    );
}

export default RootScreen;
