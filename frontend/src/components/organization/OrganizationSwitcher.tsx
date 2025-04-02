import React, { useState } from 'react';
import { 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  Button, 
  Box, 
  Text, 
  HStack,
  Divider,
  Icon,
  Spinner,
  useColorModeValue
} from '@/utils/chakra-compat';
import { ChevronDown, Building, Plus, Settings, Users } from 'lucide-react';
import { useOrganization, Organization } from '@/context/OrganizationContext';
import { useRouter } from 'next/router';

interface OrganizationSwitcherProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'ghost';
  showCreateOption?: boolean;
  showManageOption?: boolean;
}

const OrganizationSwitcher: React.FC<OrganizationSwitcherProps> = ({
  size = 'md',
  variant = 'outline',
  showCreateOption = true,
  showManageOption = true
}) => {
  const { 
    organizations, 
    currentOrganization, 
    isLoading, 
    setCurrentOrganization 
  } = useOrganization();
  const [isChanging, setIsChanging] = useState(false);
  const router = useRouter();
  
  // Colors
  const menuBgColor = useColorModeValue('white', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.100', 'gray.600');
  const dividerColor = useColorModeValue('gray.200', 'gray.600');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');
  
  // Handle switching organizations
  const handleSwitchOrganization = async (id: string) => {
    if (id === currentOrganization?.id) return;
    
    setIsChanging(true);
    await setCurrentOrganization(id);
    setIsChanging(false);
  };
  
  // Navigate to create organization page
  const handleCreateOrganization = () => {
    router.push('/organizations/create');
  };
  
  // Navigate to manage organizations page
  const handleManageOrganizations = () => {
    router.push('/organizations/manage');
  };
  
  // Group organizations by hierarchy
  const groupedOrganizations = React.useMemo(() => {
    const result: Record<string, Organization[]> = {
      owned: [],
      parent: [],
      child: [],
      other: []
    };
    
    organizations.forEach(org => {
      // If this is the current user's organization they own
      if (org.ownerId === currentOrganization?.ownerId) {
        result.owned.push(org);
      }
      // If this is a parent of the current organization
      else if (currentOrganization?.parentId === org.id) {
        result.parent.push(org);
      }
      // If this is a child of the current organization
      else if (org.parentId === currentOrganization?.id) {
        result.child.push(org);
      }
      // Other organizations
      else {
        result.other.push(org);
      }
    });
    
    return result;
  }, [organizations, currentOrganization]);
  
  if (isLoading) {
    return (
      <Button
        size={size}
        variant={variant}
        isLoading
        loadingText="Loading"
        spinnerPlacement="start"
      >
        Loading
      </Button>
    );
  }
  
  return (
    <Menu>
      <MenuButton
        as={Button}
        size={size}
        variant={variant}
        rightIcon={<ChevronDown size={16} />}
        leftIcon={<Building size={16} />}
        isLoading={isChanging}
        loadingText={currentOrganization?.name}
      >
        {!isChanging && currentOrganization?.name}
      </MenuButton>
      
      <MenuList bg={menuBgColor} maxH="400px" overflowY="auto">
        {/* My Organizations */}
        {groupedOrganizations.owned.length > 0 && (
          <>
            <Text fontSize="xs" fontWeight="medium" px={3} py={2} color={secondaryTextColor}>
              My Organizations
            </Text>
            {groupedOrganizations.owned.map(org => (
              <MenuItem
                key={org.id}
                onClick={() => handleSwitchOrganization(org.id)}
                bg={org.id === currentOrganization?.id ? hoverBgColor : 'transparent'}
                _hover={{ bg: hoverBgColor }}
              >
                <HStack>
                  <Building size={16} />
                  <Text>{org.name}</Text>
                </HStack>
              </MenuItem>
            ))}
            <Divider my={2} borderColor={dividerColor} />
          </>
        )}
        
        {/* Parent Organizations */}
        {groupedOrganizations.parent.length > 0 && (
          <>
            <Text fontSize="xs" fontWeight="medium" px={3} py={2} color={secondaryTextColor}>
              Parent Organizations
            </Text>
            {groupedOrganizations.parent.map(org => (
              <MenuItem
                key={org.id}
                onClick={() => handleSwitchOrganization(org.id)}
                _hover={{ bg: hoverBgColor }}
              >
                <HStack>
                  <Building size={16} />
                  <Text>{org.name}</Text>
                </HStack>
              </MenuItem>
            ))}
            <Divider my={2} borderColor={dividerColor} />
          </>
        )}
        
        {/* Child Organizations */}
        {groupedOrganizations.child.length > 0 && (
          <>
            <Text fontSize="xs" fontWeight="medium" px={3} py={2} color={secondaryTextColor}>
              Client Organizations
            </Text>
            {groupedOrganizations.child.map(org => (
              <MenuItem
                key={org.id}
                onClick={() => handleSwitchOrganization(org.id)}
                _hover={{ bg: hoverBgColor }}
              >
                <HStack>
                  <Building size={16} />
                  <Text>{org.name}</Text>
                </HStack>
              </MenuItem>
            ))}
            <Divider my={2} borderColor={dividerColor} />
          </>
        )}
        
        {/* Other Organizations */}
        {groupedOrganizations.other.length > 0 && (
          <>
            <Text fontSize="xs" fontWeight="medium" px={3} py={2} color={secondaryTextColor}>
              Other Organizations
            </Text>
            {groupedOrganizations.other.map(org => (
              <MenuItem
                key={org.id}
                onClick={() => handleSwitchOrganization(org.id)}
                _hover={{ bg: hoverBgColor }}
              >
                <HStack>
                  <Building size={16} />
                  <Text>{org.name}</Text>
                </HStack>
              </MenuItem>
            ))}
            <Divider my={2} borderColor={dividerColor} />
          </>
        )}
        
        {/* Actions */}
        <Box px={1}>
          {showCreateOption && (
            <MenuItem 
              onClick={handleCreateOrganization}
              _hover={{ bg: hoverBgColor }}
            >
              <HStack>
                <Plus size={16} />
                <Text>Create Organization</Text>
              </HStack>
            </MenuItem>
          )}
          
          {showManageOption && (
            <MenuItem 
              onClick={handleManageOrganizations}
              _hover={{ bg: hoverBgColor }}
            >
              <HStack>
                <Settings size={16} />
                <Text>Manage Organizations</Text>
              </HStack>
            </MenuItem>
          )}
        </Box>
      </MenuList>
    </Menu>
  );
};

export default OrganizationSwitcher;