import { useState, useCallback, useEffect } from 'react';
import { 
  OrganizationSettings, 
  UpdateOrganizationSettingsRequest 
} from '@/types/user-management';
import { organizationSettings } from '@/mocks/userManagementData';

export function useOrganizationSettings() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);

  // Fetch organization settings
  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSettings(organizationSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update organization settings
  const updateSettings = useCallback(async (updates: UpdateOrganizationSettingsRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real application, this would call an API
      console.log('Updating organization settings:', updates);
      
      // Update settings in state with the mock implementation
      if (settings) {
        const updatedSettings = {
          ...settings,
          ...updates,
          securitySettings: updates.securitySettings 
            ? { ...settings.securitySettings, ...updates.securitySettings }
            : settings.securitySettings,
          updatedAt: new Date()
        };
        
        setSettings(updatedSettings);
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [settings]);

  // Update password policy
  const updatePasswordPolicy = useCallback(async (policy: Partial<OrganizationSettings['securitySettings']['passwordPolicy']>) => {
    if (!settings) return false;
    
    return updateSettings({
      securitySettings: {
        passwordPolicy: {
          ...settings.securitySettings.passwordPolicy,
          ...policy
        }
      }
    });
  }, [settings, updateSettings]);

  // Update security settings
  const updateSecuritySettings = useCallback(async (securitySettings: Partial<OrganizationSettings['securitySettings']>) => {
    return updateSettings({ securitySettings });
  }, [updateSettings]);

  // Set organization's primary and secondary colors
  const updateColors = useCallback(async (primaryColor?: string, secondaryColor?: string) => {
    return updateSettings({ primaryColor, secondaryColor });
  }, [updateSettings]);

  // Set organization's default language and timezone
  const updateLocalization = useCallback(async (defaultLanguage?: string, defaultTimezone?: string) => {
    return updateSettings({ defaultLanguage, defaultTimezone });
  }, [updateSettings]);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    isLoading,
    error,
    
    // Update operations
    updateSettings,
    updatePasswordPolicy,
    updateSecuritySettings,
    updateColors,
    updateLocalization,
    
    // Refetch
    refetch: fetchSettings
  };
}