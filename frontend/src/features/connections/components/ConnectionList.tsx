/// <reference path="../../types/module-declarations.d.ts" />
import React from 'react';
import { Box  } from '@/utils/chakra-compat';
import { VStack  } from '@/utils/chakra-compat';
import { HStack  } from '@/utils/chakra-compat';
import { Card  } from '@/utils/chakra-compat';
import { CardBody  } from '@/utils/chakra-compat';
import { Heading  } from '@/utils/chakra-compat';
import { Text  } from '@/utils/chakra-compat';
import { Badge  } from '@/utils/chakra-compat';
import { Button  } from '@/utils/chakra-compat';
import { Menu  } from '@/utils/chakra-compat';
import { MenuButton  } from '@/utils/chakra-compat';
import { MenuList  } from '@/utils/chakra-compat';
import { MenuItem  } from '@/utils/chakra-compat';
import { Flex  } from '@/utils/chakra-compat';
import { Spinner  } from '@/utils/chakra-compat';
import { Link as ChakraLink  } from '@/utils/chakra-compat';
import { MoreVertical, Plus, RefreshCw } from 'lucide-react';

export interface ConnectionListProps {
  onAddClick: () => void;
  onEditClick?: (connection: any) => void;
  onDeleteClick?: (connection: any) => void;
  onTestClick?: (connection: any) => void;
  connections?: any[];
  loading?: boolean;
}

export function ConnectionList({ 
  onAddClick, 
  onEditClick,
  onDeleteClick,
  onTestClick,
  connections = [],
  loading = false
}: ConnectionListProps) {
  if (loading) {
    return (
      <Flex justify="center" py={8}>
        <Spinner size="xl"  />
      </Flex>
    );
  }
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Connections</Heading>
        <Button
          size="sm"
          leftIcon={<Plus size={16} />}
          onClick={onAddClick}
        >
          Add Connection
        </Button>
      </Flex>
      
      {connections.length === 0 ? (
        <Card>
          <CardBody textAlign="center" py={8}>
            <Text color="gray.500" mb={4}>No connections found</Text>
            <Button
              size="sm"
              leftIcon={<Plus size={16} />}
              onClick={onAddClick}
            >
              Add Your First Connection
            </Button>
          </CardBody>
        </Card>
      ) : (
        <VStack gap={4} align="stretch">
          {connections?.map((connection: any) => (
            <Card key={connection.id}>
              <CardBody>
                <Flex justify="space-between">
                  <Box>
                    <HStack mb={1}>
                      <Heading size="sm">{connection.name}</Heading>
                      <Badge colorScheme="green">Active</Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.500">
                      Type: {connection.type}
                    </Text>
                    {connection.url && (
                      <ChakraLink fontSize="sm" href={connection.url} external>
                        {connection.url}
                      </ChakraLink>
                    )}
                  </Box>
                  
                  <Menu>
                    <MenuButton 
                      as={Button} 
                      variant="ghost" 
                      size="sm"
                      aria-label="Options"
                    >
                      <MoreVertical size={16} />
                    </MenuButton>
                    <MenuList>
                      {onEditClick && (
                        <MenuItem onClick={() => onEditClick(connection)}>
                          Edit
                        </MenuItem>
                      )}
                      {onTestClick && (
                        <MenuItem 
                          onClick={() => onTestClick(connection)}
                          icon={<RefreshCw size={14} />}
                        >
                          Test Connection
                        </MenuItem>
                      )}
                      {onDeleteClick && (
                        <MenuItem 
                          onClick={() => onDeleteClick(connection)}
                          color="red.500"
                        >
                          Delete
                        </MenuItem>
                      )}
                    </MenuList>
                  </Menu>
                </Flex>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}
    </Box>
  );
}

export default ConnectionList;