'use client'

import { Box } from '@chakra-ui/react/box'
import { Button } from '@chakra-ui/react/button'
import { Heading } from '@chakra-ui/react/heading'
import { Flex } from '@chakra-ui/react/flex'
import { Text } from '@chakra-ui/react/text'
import { Input } from '@chakra-ui/react/input'
import { FormControl, FormLabel, FormErrorMessage } from '@chakra-ui/react/form-control'
import { Card, CardBody, CardHeader, CardFooter } from '@chakra-ui/react/card'
import { useColorMode } from '@chakra-ui/react/color-mode'
import { useState } from 'react'
import { createToaster } from '@chakra-ui/react/toast'

interface FormValues {
  name: string
  email: string
}

interface FormErrors {
  name?: string
  email?: string
}

export function ChakraV3Example() {
  const { colorMode } = useColorMode()
  const [loading, setLoading] = useState(false)
  const [values, setValues] = useState<FormValues>({ name: '', email: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const toast = createToaster()

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!values.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!values.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      newErrors.email = 'Invalid email address'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setValues(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      toast.show({
        title: 'Form submitted',
        description: 'Your form has been submitted successfully',
        status: 'success',
      })
      setValues({ name: '', email: '' })
    }, 1500)
  }

  return (
    <Card 
      maxW="md" 
      mx="auto"
      bg={colorMode === 'light' ? 'white' : 'gray.700'}
    >
      <CardHeader>
        <Heading size="lg">Contact Form</Heading>
        <Text mt={2} color={colorMode === 'light' ? 'gray.600' : 'gray.300'}>
          Example form using Chakra UI v3
        </Text>
      </CardHeader>
      
      <CardBody>
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap={4}>
            <FormControl isInvalid={!!errors.name}>
              <FormLabel htmlFor="name">Name</FormLabel>
              <Input
                id="name"
                name="name"
                value={values.name}
                onChange={handleChange}
                placeholder="Enter your name"
              />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={!!errors.email}>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                id="email"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>
          </Flex>
        </form>
      </CardBody>
      
      <CardFooter>
        <Button 
          loading={loading} 
          onClick={handleSubmit}
          w="full"
        >
          Submit
        </Button>
      </CardFooter>
    </Card>
  )
}