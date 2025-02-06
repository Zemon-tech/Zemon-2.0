import { Box, VStack, Circle, Divider } from '@chakra-ui/react'
import * as React from 'react'

export const TimelineRoot = ({ children, ...props }) => (
  <VStack spacing={0} align="stretch" {...props}>
    {children}
  </VStack>
);

export const TimelineItem = ({ children, ...props }) => (
  <Box position="relative" pb={4} {...props}>
    {children}
  </Box>
);

export const TimelineConnector = React.forwardRef(
  function TimelineConnector({ children, ...props }, ref) {
    return (
      <Box position="absolute" left="15px" top="0" bottom="0" width="2px" {...props}>
        <Divider orientation="vertical" borderColor="gray.200" height="100%" />
        <Circle size="8px" bg="blue.500" position="absolute" left="-3px" top="0" />
      </Box>
    );
  }
);

export const TimelineContent = ({ children, ...props }) => (
  <Box pl={10} {...props}>
    {children}
  </Box>
);

export const TimelineIndicator = ({ children, ...props }) => (
  <Circle size="8px" bg="blue.500" {...props}>
    {children}
  </Circle>
);

export const TimelineTitle = ({ children, ...props }) => (
  <Box fontWeight="bold" {...props}>
    {children}
  </Box>
);

export const TimelineDescription = ({ children, ...props }) => (
  <Box color="gray.600" {...props}>
    {children}
  </Box>
);
