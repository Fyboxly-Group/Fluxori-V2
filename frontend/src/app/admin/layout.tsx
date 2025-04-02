import { ReactNode } from 'react';
import { Box, Title, Breadcrumbs, Anchor, Group } from '@mantine/core';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  // In a real app, these would be dynamic based on the current route
  const breadcrumbItems = [
    { title: 'Home', href: '/' },
    { title: 'Admin', href: '/admin' },
    { title: 'Users', href: '/admin/users' }
  ];

  return (
    <Box p="md">
      <Group position="apart" mb="lg">
        <Title order={1}>Admin Dashboard</Title>
        
        <Breadcrumbs>
          {breadcrumbItems.map((item, index) => (
            <Anchor 
              href={item.href}
              key={index}
              color={index === breadcrumbItems.length - 1 ? 'dimmed' : 'blue'}
            >
              {item.title}
            </Anchor>
          ))}
        </Breadcrumbs>
      </Group>
      
      {children}
    </Box>
  );
}