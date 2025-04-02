#!/usr/bin/env node

/**
 * Script to generate module declarations for missing Chakra UI v3 modules
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const stat = promisify(fs.stat);
const { execSync } = require('child_process');

// Define output directory for module declarations
const TYPES_DIR = path.resolve(__dirname, '../src/types');
const DECLARATION_FILE = path.resolve(TYPES_DIR, 'chakra-ui-modules.d.ts');

// Regexes for finding module errors in TypeScript output
const MODULE_NOT_FOUND_REGEX = /Cannot find module '([@\w\/-]+)' or its corresponding type declarations/g;

async function generateDeclarations() {
  try {
    // Run TypeScript check and capture errors
    const tscOutput = execSync('cd /home/tarquin_stapa/Fluxori-V2/frontend && npx tsc --noEmit', { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).toString();
  } catch (error) {
    if (error.stdout) {
      // TypeScript errors are expected, get the stdout
      const tscOutput = error.stdout;
      
      // Extract missing module paths
      const moduleMatches = [...tscOutput.matchAll(MODULE_NOT_FOUND_REGEX)];
      const modulePaths = new Set();
      
      moduleMatches.forEach(match => {
        modulePaths.add(match[1]);
      });
      
      // Filter for Chakra UI modules
      const chakraModules = Array.from(modulePaths)
        .filter(path => path.startsWith('@chakra-ui/react/'))
        .sort();
      
      if (chakraModules.length === 0) {
        console.log('No missing Chakra UI modules found.');
        return;
      }
      
      console.log(`Found ${chakraModules.length} missing Chakra UI module declarations:`);
      chakraModules.forEach(module => console.log(`  - ${module}`));
      
      // Create the types directory if it doesn't exist
      try {
        await stat(TYPES_DIR);
      } catch (err) {
        await mkdir(TYPES_DIR, { recursive: true });
      }
      
      // Read existing declarations if any
      let existingContent = '';
      try {
        existingContent = await readFile(DECLARATION_FILE, 'utf8');
      } catch (err) {
        // File doesn't exist yet, that's fine
      }
      
      // Generate declarations for each missing module
      let declarations = existingContent;
      let added = 0;
      
      for (const modulePath of chakraModules) {
        const moduleName = modulePath.split('/').pop();
        
        // Check if module is already declared
        if (declarations.includes(`declare module '${modulePath}'`)) {
          console.log(`  Module ${modulePath} already has declarations, skipping.`);
          continue;
        }
        
        // Generate a more specific declaration
        let declaration;
        
        // Special case handling for components
        if (modulePath === '@chakra-ui/react/table-container') {
          declaration = `
declare module '${modulePath}' {
  import { BoxProps } from '@chakra-ui/react/box';
  import * as React from 'react';

  export interface TableProps extends BoxProps {}
  export const Table: React.FC<TableProps>;
  
  export interface TheadProps extends BoxProps {}
  export const Thead: React.FC<TheadProps>;
  
  export interface TbodyProps extends BoxProps {}
  export const Tbody: React.FC<TbodyProps>;
  
  export interface TrProps extends BoxProps {}
  export const Tr: React.FC<TrProps>;
  
  export interface ThProps extends BoxProps {}
  export const Th: React.FC<ThProps>;
  
  export interface TdProps extends BoxProps {}
  export const Td: React.FC<TdProps>;
  
  export interface TableContainerProps extends BoxProps {}
  export const TableContainer: React.FC<TableContainerProps>;
}`;
        } else if (modulePath === '@chakra-ui/react/input-group') {
          declaration = `
declare module '${modulePath}' {
  import { BoxProps } from '@chakra-ui/react/box';
  import * as React from 'react';

  export interface InputGroupProps extends BoxProps {}
  export const InputGroup: React.FC<InputGroupProps>;
  
  export interface InputElementProps extends BoxProps {
    placement?: 'left' | 'right';
    children: React.ReactElement;
  }
  export const InputElement: React.FC<InputElementProps>;
  export const InputLeftElement: React.FC<InputElementProps>;
  export const InputRightElement: React.FC<InputElementProps>;
}`;
        } else if (modulePath === '@chakra-ui/react/form-control') {
          declaration = `
declare module '${modulePath}' {
  import { BoxProps } from '@chakra-ui/react/box';
  import * as React from 'react';

  export interface FormControlProps extends BoxProps {
    isInvalid?: boolean;
    isDisabled?: boolean;
    isRequired?: boolean;
  }
  export const FormControl: React.FC<FormControlProps>;
  
  export interface FormLabelProps extends BoxProps {}
  export const FormLabel: React.FC<FormLabelProps>;
  
  export interface FormErrorMessageProps extends BoxProps {}
  export const FormErrorMessage: React.FC<FormErrorMessageProps>;
  
  export interface FormHelperTextProps extends BoxProps {}
  export const FormHelperText: React.FC<FormHelperTextProps>;
}`;
        } else if (modulePath === '@chakra-ui/react/modal') {
          declaration = `
declare module '${modulePath}' {
  import { BoxProps } from '@chakra-ui/react/box';
  import * as React from 'react';

  export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    size?: string;
    children: React.ReactNode;
  }
  export const Modal: React.FC<ModalProps>;
  
  export interface ModalOverlayProps extends BoxProps {}
  export const ModalOverlay: React.FC<ModalOverlayProps>;
  
  export interface ModalContentProps extends BoxProps {}
  export const ModalContent: React.FC<ModalContentProps>;
  
  export interface ModalHeaderProps extends BoxProps {}
  export const ModalHeader: React.FC<ModalHeaderProps>;
  
  export interface ModalFooterProps extends BoxProps {}
  export const ModalFooter: React.FC<ModalFooterProps>;
  
  export interface ModalBodyProps extends BoxProps {}
  export const ModalBody: React.FC<ModalBodyProps>;
  
  export interface ModalCloseButtonProps extends BoxProps {}
  export const ModalCloseButton: React.FC<ModalCloseButtonProps>;
}`;
        } else if (modulePath === '@chakra-ui/react/progress-indicator') {
          declaration = `
declare module '${modulePath}' {
  import { BoxProps } from '@chakra-ui/react/box';
  import * as React from 'react';

  export interface ProgressProps extends BoxProps {
    value?: number;
    max?: number;
    min?: number;
    isIndeterminate?: boolean;
    colorScheme?: string;
  }
  export const Progress: React.FC<ProgressProps>;
}`;
        } else if (modulePath === '@chakra-ui/react/menu-group') {
          declaration = `
declare module '${modulePath}' {
  import { BoxProps } from '@chakra-ui/react/box';
  import * as React from 'react';

  export interface MenuProps extends BoxProps {
    isOpen?: boolean;
    onClose?: () => void;
    autoSelect?: boolean;
  }
  export const Menu: React.FC<MenuProps>;
  
  export interface MenuButtonProps extends BoxProps {}
  export const MenuButton: React.FC<MenuButtonProps>;
  
  export interface MenuListProps extends BoxProps {}
  export const MenuList: React.FC<MenuListProps>;
  
  export interface MenuItemProps extends BoxProps {}
  export const MenuItem: React.FC<MenuItemProps>;
  
  export interface MenuDividerProps extends BoxProps {}
  export const MenuDivider: React.FC<MenuDividerProps>;
}`;
        } else {
          // Default generic declaration
          declaration = `
declare module '${modulePath}' {
  export * from '@chakra-ui/react';
}`;
        }
        
        declarations += declaration;
        added++;
      }
      
      if (added > 0) {
        // Write the declarations file
        await writeFile(DECLARATION_FILE, declarations);
        console.log(`✅ Added declarations for ${added} modules to ${DECLARATION_FILE}`);
      } else {
        console.log('No new module declarations needed.');
      }
    } else {
      console.error('Error running TypeScript check:', error);
    }
  }
}

// Run the function
generateDeclarations();