const fs = require('fs');
const path = require('path');

console.log('🚀 Starting DisconnectAlertDialog fix script');

const sourceFilePath = path.resolve(__dirname, '../src/features/connections/components/DisconnectAlertDialog.tsx');

// Completely rebuild the file with proper TypeScript and Chakra UI v3 patterns
const fixedContent = `import React, { useRef } from 'react';
import { AlertDialog } from '@chakra-ui/react/alert-dialog';
import { AlertDialogBody } from '@chakra-ui/react/alert-dialog';
import { AlertDialogFooter } from '@chakra-ui/react/alert-dialog';
import { AlertDialogHeader } from '@chakra-ui/react/alert-dialog';
import { AlertDialogContent } from '@chakra-ui/react/alert-dialog';
import { AlertDialogOverlay } from '@chakra-ui/react/alert-dialog';
import { AlertDialogCloseButton } from '@chakra-ui/react/alert-dialog';
import { Button } from '@chakra-ui/react/button';
import { Text } from '@chakra-ui/react/text';

export interface DisconnectAlertDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  connectionName: string;
}

export function DisconnectAlertDialog({ 
  open, 
  onClose, 
  onConfirm,
  connectionName
}: DisconnectAlertDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  
  return (
    <AlertDialog
      isOpen={open}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Disconnect {connectionName}
          </AlertDialogHeader>
          
          <AlertDialogCloseButton />
          
          <AlertDialogBody>
            Are you sure you want to disconnect this integration? This will remove all associated data and cannot be undone.
          </AlertDialogBody>
          
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={onConfirm} ml={3}>
              Disconnect
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}

export default DisconnectAlertDialog;`;

try {
  fs.writeFileSync(sourceFilePath, fixedContent);
  console.log('✅ Fixed src/features/connections/components/DisconnectAlertDialog.tsx');
} catch (error) {
  console.error('❌ Error fixing DisconnectAlertDialog.tsx:', error);
}

console.log('✅ All fixes applied');