'use client'

import { Box } from '@chakra-ui/react/box'
import { Button } from '@chakra-ui/react/button'
import { Heading } from '@chakra-ui/react/heading'
import { Flex } from '@chakra-ui/react/flex'
import { Text } from '@chakra-ui/react/text'
import { Stack } from '@chakra-ui/react/stack'
import { Card, CardBody, CardHeader, CardFooter } from '@chakra-ui/react/card'
import { useColorMode } from '@chakra-ui/react/color-mode'
import { useState } from 'react'
import { createToaster } from '@chakra-ui/react/toast'

export default function Home() {
  const { colorMode, toggleColorMode } = useColorMode()
  const [loading, setLoading] = useState(false)
  const toast = createToaster()

  const handleClick = () => {
    setLoading(true)
    
    // Simulate an API call
    setTimeout(() => {
      setLoading(false)
      toast.show({
        title: 'Action completed',
        description: 'Your request has been processed successfully',
        status: 'success',
      })
    }, 1500)
  }

  return (
    <Box minH="100vh" py={12} px={4}>
      <Flex direction="column" maxW="1200px" mx="auto">
        <Flex justify="flex-end" mb={8}>
          <Button onClick={toggleColorMode}>
            Toggle {colorMode === 'light' ? 'Dark' : 'Light'} Mode
          </Button>
        </Flex>
        
        <Heading as="h1" size="2xl" mb={6} textAlign="center">
          Welcome to Fluxori V2
        </Heading>
        
        <Text fontSize="xl" mb={12} textAlign="center">
          This is a Next.js app with Chakra UI v3 integration
        </Text>
        
        <Stack gap={8} direction={{ base: 'column', md: 'row' }} align="stretch">
          <Card>
            <CardHeader>
              <Heading size="md">Chakra UI v3 Features</Heading>
            </CardHeader>
            <CardBody>
              <Stack gap={4}>
                <Text>Direct imports for better tree-shaking</Text>
                <Text>New component API with simplified props</Text>
                <Text>Improved toast API with createToaster</Text>
                <Text>Enhanced theme configuration</Text>
              </Stack>
            </CardBody>
            <CardFooter>
              <Button variant="outline" onClick={() => window.open('https://chakra-ui.com/docs/getting-started', '_blank')}>
                Learn More
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <Heading size="md">Try It Out</Heading>
            </CardHeader>
            <CardBody>
              <Text mb={4}>
                Click the button below to test the new toast API and loading state
              </Text>
              <Button 
                loading={loading} 
                onClick={handleClick}
                w="full"
              >
                Show Toast Notification
              </Button>
            </CardBody>
            <CardFooter>
              <Text fontSize="sm" color="gray.500">
                This demonstrates Chakra UI v3's simplified API for handling loading states
              </Text>
            </CardFooter>
          </Card>
        </Stack>
      </Flex>
    </Box>
  )
}