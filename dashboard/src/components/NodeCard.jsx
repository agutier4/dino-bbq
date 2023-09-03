import { Box, AspectRatio, VStack } from '@chakra-ui/react';
import { useContext } from 'react';
import DinoContext from '../context/DinoContext';

function NodeCard({ node }) {
    const { sendRoarCommand } = useContext(DinoContext);
    return (
        <AspectRatio
            ratio={1}
            border="3px solid rgba(0,0,0,0.2)"
            bg="rgba(250,250,250,1.0)"
            minW="150px"
            maxW="200px"
            m="2px"
            cursor="pointer"
            onClick={() => {
                sendRoarCommand(node.id);
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
                <Box>DINO-NODE-{node.id}</Box>
                <Box>Status: {node.health}</Box>
                <Box>Voltage: {node.voltage || '--'}v</Box>
            </VStack>
        </AspectRatio>
    );
}

export default NodeCard;
