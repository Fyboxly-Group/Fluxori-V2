/// <reference path="../../types/module-declarations.d.ts" />
'use client'

import React, { useState } from 'react'
import { Divider, FormErrorMessage, useColorMode, createToaster } from '@/utils/chakra-compat'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ResponsiveValue } from '../../../utils/chakra-utils';
;
;
;
;
;
;
;
;
;
;
;
;
;
;

// Fix for Next.js module resolution
import { ChakraProvider } from "@chakra-ui/react";
import { Card, CardHeader, Heading, Text, CardBody, VStack, FormControl, FormLabel, Input, Box, Link as ChakraLink, Button, CardFooter } from '@/utils/chakra/components';
import { Checkbox } from '@/components/stubs/ChakraStubs';



type FormData = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

type FormErrors = {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  terms?: string
}

export default function Register() {
  const { colorMode } = useColorMode()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const toast = createToaster()
  const router = useRouter()

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must include uppercase, lowercase, and numbers'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (!termsAccepted) {
      newErrors.terms = 'You must accept the terms and conditions'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // This is where you would normally call your registration API
      // For demo purposes, we'll just simulate a successful registration
      
      toast.show({
        title: 'Registration successful',
        description: 'Welcome to Fluxori! You can now log in.',
        status: 'success',
      })
      
      // Redirect to login
      router.push('/auth/login')
    } catch (error) {
      toast.show({
        title: 'Registration failed',
        description: 'An error occurred during registration',
        status: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card 
      width={{ base: 'full', sm: '450px' } as ResponsiveValue<number>}
      bg={colorMode === 'light' ? 'white' : 'gray.800'}
      boxShadow="lg"
    >
      <CardHeader>
        <Heading size="lg" textAlign="center">Create an Account</Heading>
        <Text mt={2} textAlign="center" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
          Join Fluxori and start your journey
        </Text>
      </CardHeader>
      
      <CardBody>
        <form onSubmit={handleSubmit}>
          <VStack gap={4}>
            <FormControl invalid={!!errors.name}>
              <FormLabel htmlFor="name">Full Name</FormLabel>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>
            
            <FormControl invalid={!!errors.email}>
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
            
            <FormControl invalid={!!errors.password}>
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
            
            <FormControl invalid={!!errors.confirmPassword}>
              <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                />
              <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
            </FormControl>
            
            <FormControl invalid={!!errors.terms}>
              <Box width="100%" mt={2}>
                <Checkbox 
                  checked={termsAccepted} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTermsAccepted(e.target.checked)}
                >
                  <Text fontSize="sm">
                    I agree to the{' '}
                    <Link href="/terms" passHref>
                      <Text 
                        as="span" 
                        color="brand.500" 
                        _hover={{ textDecoration: 'underline' }}
                        cursor="pointer"
                      >
                        Terms of Service
                      </Text>
                    </Link>
                    {' '}and{' '}
                    <Link href="/privacy" passHref>
                      <Text 
                        as="span" 
                        color="brand.500" 
                        _hover={{ textDecoration: 'underline' }}
                        cursor="pointer"
                      >
                        Privacy Policy
                      </Text>
                    </Link>
                  </Text>
                </Checkbox>
                {errors.terms && (
                  <Text color="red.500" fontSize="sm" mt={1}>{errors.terms}</Text>
                )}
              </Box>
            </FormControl>
            
            <Button 
              type="submit" 
              width="full" 
              mt={4} 
              loading={loading}
            >
              Create Account
            </Button>
          </VStack>
        </form>
      </CardBody>
      
      <Divider   />
      
      <CardFooter justifyContent="center">
        <Text>
          Already have an account?{' '}
          <Link href="/auth/login" passHref>
            <Text 
              as="span" 
              color="brand.500" 
              _hover={{ textDecoration: 'underline' }}
              cursor="pointer"
              fontWeight="medium"
            >
              Log in
            </Text>
          </Link>
        </Text>
      </CardFooter>
    </Card>
  )
}