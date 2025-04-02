/// <reference path="../../types/module-declarations.d.ts" />
import React, { useRef } from 'react';
import { AlertDialog  } from '@/utils/chakra-compat';
import { AlertDialogBody  } from '@/utils/chakra-compat';
import { AlertDialogFooter  } from '@/utils/chakra-compat';
import { AlertDialogHeader  } from '@/utils/chakra-compat';
import { AlertDialogContent  } from '@/utils/chakra-compat';
import { AlertDialogOverlay  } from '@/utils/chakra-compat';
import { AlertDialogCloseButton } from '@/components/stubs/ChakraStubs';;
import { Button  } from '@/utils/chakra-compat';
import { Text  } from '@/utils/chakra-compat';


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

export default DisconnectAlertDialog;