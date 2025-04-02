import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useToast } from '@/utils/chakra-compat';
import { useAuth } from './AuthContext';

// Define the Organization type
export interface Organization {
  id: string;
  name: string;
  displayName?: string;
  type: string;
  status: string;
  parentId?: string;
  rootId?: string;
  path?: string[];
  ownerId: string;
  settings?: {
    allowSuborganizations?: boolean;
    maxUsers?: number;
    maxSuborganizations?: number;
    defaultUserRole?: string;
    theme?: string;
    features?: string[];
  };
  metadata?: Record<string, any>;
  createdAt: any;
  updatedAt: any;
}

// Define the context shape
interface OrganizationContextProps {
  organizations: Organization[];
  currentOrganization: Organization | null;
  isLoading: boolean;
  error: string | null;
  setCurrentOrganization: (organizationId: string) => Promise<void>;
  refreshOrganizations: () => Promise<void>;
}

// Create the context
const OrganizationContext = createContext<OrganizationContextProps | undefined>(undefined);

// Create a provider component
interface OrganizationProviderProps {
  children: ReactNode;
}

export const OrganizationProvider: React.FC<OrganizationProviderProps> = ({ children }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganizationState] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const { user, isAuthenticated } = useAuth();

  // Fetch organizations on authentication change
  useEffect(() => {
    if (isAuthenticated) {
      refreshOrganizations();
    } else {
      setOrganizations([]);
      setCurrentOrganizationState(null);
    }
  }, [isAuthenticated]);

  // Fetch all organizations the user has access to
  const refreshOrganizations = async (): Promise<void> => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/organizations', {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }
      
      const data = await response.json();
      setOrganizations(data.organizations);
      
      // If we have organizations but no current organization set,
      // set the first one as current
      if (data.organizations.length > 0 && !currentOrganization) {
        const defaultOrg = data.organizations.find((org: Organization) => 
          org.id === user?.defaultOrganizationId
        ) || data.organizations[0];
        
        setCurrentOrganizationState(defaultOrg);
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error fetching organizations',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Change the current organization
  const setCurrentOrganization = async (organizationId: string): Promise<void> => {
    try {
      // Find the organization in our list
      const org = organizations.find(org => org.id === organizationId);
      if (!org) {
        throw new Error('Organization not found');
      }
      
      // Update the user's default organization
      const response = await fetch(`/api/organizations/current/${organizationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to update current organization');
      }
      
      // Update local state
      setCurrentOrganizationState(org);
      
      toast({
        title: 'Organization switched',
        description: `You are now viewing ${org.name}`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error switching organization',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  const value = {
    organizations,
    currentOrganization,
    isLoading,
    error,
    setCurrentOrganization,
    refreshOrganizations
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

// Custom hook to use the organization context
export const useOrganization = (): OrganizationContextProps => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};