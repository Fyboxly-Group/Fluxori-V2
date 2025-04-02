'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextInput,
  PasswordInput,
  Checkbox,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  Group,
  Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import AnimatedButton from '@/components/Button/AnimatedButton';
import { useAnimatedMount } from '@/hooks/useAnimation';
import { fadeInUp, scaleIn } from '@/animations/gsap';
import useAuth from '@/hooks/useAuth';
import gsap from 'gsap';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Animation refs
  const containerRef = useAnimatedMount('fadeInUp', { duration: 0.5 });
  const formRef = useRef<HTMLFormElement>(null);
  
  // Setup form
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters'),
    },
  });
  
  // Handle form submission
  const handleSubmit = async (values: typeof form.values) => {
    try {
      await login.mutateAsync({
        email: values.email,
        password: values.password,
      });
      
      // Show success notification
      notifications.show({
        title: 'Login successful',
        message: 'Redirecting to dashboard...',
        color: 'green',
      });
      
      // Animate form out before redirecting
      if (formRef.current) {
        gsap.to(formRef.current, {
          opacity: 0,
          y: -20,
          duration: 0.4,
          onComplete: () => {
            router.push('/dashboard');
          },
        });
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      // Show error notification
      notifications.show({
        title: 'Login failed',
        message: error instanceof Error ? error.message : 'Please check your credentials and try again',
        color: 'red',
      });
      
      // Shake the form to indicate error
      if (formRef.current) {
        gsap.timeline()
          .to(formRef.current, { x: -10, duration: 0.1 })
          .to(formRef.current, { x: 10, duration: 0.1 })
          .to(formRef.current, { x: -10, duration: 0.1 })
          .to(formRef.current, { x: 10, duration: 0.1 })
          .to(formRef.current, { x: 0, duration: 0.1 });
      }
    }
  };
  
  if (isLoading) {
    return null; // Or a loading spinner
  }
  
  return (
    <Container size={420} my={40} ref={containerRef}>
      <Title
        align="center"
        sx={(theme) => ({ fontFamily: theme.headings.fontFamily, fontWeight: 700 })}
      >
        Welcome to Fluxori V2!
      </Title>
      <Text color="dimmed" size="sm" align="center" mt={5}>
        Don't have an account yet?{' '}
        <Anchor<'a'> href="/register" size="sm">
          Create account
        </Anchor>
      </Text>

      <Paper
        withBorder
        shadow="md"
        p={30}
        mt={30}
        radius="md"
        ref={formRef}
        component="form"
        onSubmit={form.onSubmit(handleSubmit)}
      >
        <TextInput
          label="Email"
          placeholder="you@example.com"
          required
          {...form.getInputProps('email')}
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          required
          mt="md"
          {...form.getInputProps('password')}
        />
        <Group position="apart" mt="md">
          <Checkbox
            label="Remember me"
            {...form.getInputProps('rememberMe', { type: 'checkbox' })}
          />
          <Anchor<'a'> onClick={(event) => event.preventDefault()} href="/forgot-password" size="sm">
            Forgot password?
          </Anchor>
        </Group>
        <AnimatedButton 
          fullWidth 
          mt="xl" 
          type="submit"
          loading={login.isLoading}
        >
          Sign in
        </AnimatedButton>
      </Paper>
    </Container>
  );
}