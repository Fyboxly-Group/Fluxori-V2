'use client'

import { useState } from 'react'
import { Box } from '@chakra-ui/react/box'
import { VStack, HStack } from '@chakra-ui/react/stack'
import { Heading } from '@chakra-ui/react/heading'
import { Text } from '@chakra-ui/react/text'
import { Input } from '@chakra-ui/react/input'
import { Button } from '@chakra-ui/react/button'
import { FormControl, FormLabel, FormErrorMessage } from '@chakra-ui/react/form-control'
import { Checkbox } from '@chakra-ui/react/checkbox'
import { Divider } from '@chakra-ui/react/divider'
import { Card, CardHeader, CardBody, CardFooter } from '@chakra-ui/react/card'
import { useColorMode } from '@chakra-ui/react/color-mode'
import { createToaster } from '@chakra-ui/react/toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

type FormData = {
  email: string
  password: string
}

type FormErrors = {
  email?: string
  password?: string
}

export default function Login() {
  const { colorMode } = useColorMode()
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const toast = createToaster()
  const router = useRouter()

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Import auth hook
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      // Use the login function from AuthContext
      await login(formData.email, formData.password)
      // The redirect is handled inside the auth context
    } catch (error) {
      // Error handling is done in the auth context
      setLoading(false)
    }
  }

  return (
    <Card 
      width={{ base: 'full', sm: '400px' }}
      bg={colorMode === 'light' ? 'white' : 'gray.800'}
      boxShadow="lg"
    >
      <CardHeader>
        <Heading size="lg" textAlign="center">Log in to Fluxori</Heading>
        <Text mt={2} textAlign="center" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
          Enter your credentials to access your account
        </Text>
      </CardHeader>
      
      <CardBody>
        <form onSubmit={handleSubmit}>
          <VStack gap={4}>
            <FormControl isInvalid={!!errors.email}>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={!!errors.password}>
              <FormLabel htmlFor="password">Password</FormLabel>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>
            
            <Box width="100%">
              <HStack justify="space-between">
                <Checkbox 
                  isChecked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)}
                >
                  Remember me
                </Checkbox>
                <Link href="/auth/forgot-password" passHref>
                  <Text 
                    fontSize="sm" 
                    color="brand.500" 
                    _hover={{ textDecoration: 'underline' }}
                    cursor="pointer"
                  >
                    Forgot password?
                  </Text>
                </Link>
              </HStack>
            </Box>
            
            <Button 
              type="submit" 
              width="full" 
              mt={4} 
              loading={loading}
            >
              Log In
            </Button>
          </VStack>
        </form>
      </CardBody>
      
      <Divider />
      
      <CardFooter justifyContent="center">
        <Text>
          Don't have an account?{' '}
          <Link href="/auth/register" passHref>
            <Text 
              as="span" 
              color="brand.500" 
              _hover={{ textDecoration: 'underline' }}
              cursor="pointer"
              fontWeight="medium"
            >
              Sign up
            </Text>
          </Link>
        </Text>
      </CardFooter>
    </Card>
  )
}