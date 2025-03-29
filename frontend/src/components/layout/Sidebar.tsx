'use client'

import { Box } from '@chakra-ui/react/box'
import { Flex } from '@chakra-ui/react/flex'
import { Text } from '@chakra-ui/react/text'
import { VStack } from '@chakra-ui/react/stack'
import { Divider } from '@chakra-ui/react/divider'
import { Heading } from '@chakra-ui/react/heading'
import { useColorMode } from '@chakra-ui/react/color-mode'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Types for sidebar menu items
type SidebarMenuItem = {
  label: string
  href: string
  icon?: React.ReactNode
}

type SidebarSection = {
  title?: string
  items: SidebarMenuItem[]
}

type SidebarProps = {
  sections: SidebarSection[]
}

// Placeholder for icons - in a real app you'd import from your icon library
const HomeIcon = () => <Box>🏠</Box>
const AnalyticsIcon = () => <Box>📊</Box>
const ProjectsIcon = () => <Box>📂</Box>
const SettingsIcon = () => <Box>⚙️</Box>
const UsersIcon = () => <Box>👥</Box>
const NotificationsIcon = () => <Box>🔔</Box>

// Default sidebar configuration
const defaultSections: SidebarSection[] = [
  {
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: <HomeIcon /> },
      { label: 'Analytics', href: '/analytics', icon: <AnalyticsIcon /> },
    ]
  },
  {
    title: 'Workspace',
    items: [
      { label: 'Projects', href: '/projects', icon: <ProjectsIcon /> },
      { label: 'Team', href: '/team', icon: <UsersIcon /> },
    ]
  },
  {
    title: 'Account',
    items: [
      { label: 'Notifications', href: '/notifications', icon: <NotificationsIcon /> },
      { label: 'Settings', href: '/settings', icon: <SettingsIcon /> },
    ]
  }
]

export function Sidebar({ sections = defaultSections }: SidebarProps) {
  const { colorMode } = useColorMode()
  const pathname = usePathname()

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <Box
      as="aside"
      height="100vh"
      width={{ base: 'full', md: '250px' }}
      bg={colorMode === 'light' ? 'white' : 'gray.800'}
      borderRight="1px solid"
      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
      position="sticky"
      top="0"
      pt="4"
      pb="10"
      overflowY="auto"
    >
      <Flex direction="column" height="full" gap={6}>
        {sections.map((section, sectionIndex) => (
          <Box key={sectionIndex} px="4">
            {section.title && (
              <Text 
                fontWeight="medium" 
                fontSize="xs" 
                textTransform="uppercase"
                letterSpacing="wider"
                mb="3"
                color={colorMode === 'light' ? 'gray.500' : 'gray.400'}
              >
                {section.title}
              </Text>
            )}
            <VStack align="stretch" gap="1">
              {section.items.map((item) => (
                <Link key={item.href} href={item.href} passHref>
                  <Flex
                    align="center"
                    px="3"
                    py="2"
                    rounded="md"
                    cursor="pointer"
                    color={
                      isActive(item.href)
                        ? (colorMode === 'light' ? 'brand.600' : 'brand.300')
                        : (colorMode === 'light' ? 'gray.700' : 'gray.300')
                    }
                    bg={
                      isActive(item.href)
                        ? (colorMode === 'light' ? 'brand.50' : 'rgba(66, 153, 225, 0.16)')
                        : 'transparent'
                    }
                    fontWeight={isActive(item.href) ? 'semibold' : 'normal'}
                    _hover={{
                      bg: colorMode === 'light' ? 'gray.100' : 'gray.700',
                      color: colorMode === 'light' ? 'gray.900' : 'white',
                    }}
                  >
                    {item.icon && <Box mr="3">{item.icon}</Box>}
                    <Text>{item.label}</Text>
                  </Flex>
                </Link>
              ))}
            </VStack>
            {sectionIndex < sections.length - 1 && (
              <Divider my="4" borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'} />
            )}
          </Box>
        ))}
      </Flex>
    </Box>
  )
}