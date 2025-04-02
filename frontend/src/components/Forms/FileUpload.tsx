import React, { useState, useRef } from 'react';
import {
  Group,
  Text,
  useMantineTheme,
  rem,
  createStyles,
  Image,
  SimpleGrid,
  Card,
  ActionIcon,
  Progress,
  Box,
  CSSObject,
} from '@mantine/core';
import { Dropzone, DropzoneProps, FileWithPath, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import {
  IconUpload,
  IconX,
  IconDownload,
  IconFile,
  IconFileZip,
  IconFileText,
  IconFileSpreadsheet,
  IconFilePdf,
  IconTrash,
  IconPhoto,
} from '@tabler/icons-react';
import gsap from 'gsap';

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: 'relative',
    marginBottom: rem(20),
  },
  dropzone: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.xl,
    borderWidth: rem(1),
    '&[data-accept]': {
      borderColor: theme.colors[theme.primaryColor][6],
    },
    '&[data-reject]': {
      borderColor: theme.colors.red[6],
    },
  },
  icon: {
    width: rem(52),
    height: rem(52),
    color: theme.colors.gray[3],
  },
  filePreview: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: theme.radius.md,
    border: `${rem(1)} solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    marginBottom: theme.spacing.xs,
  },
  fileControls: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: rem(4),
    zIndex: 10,
    display: 'flex',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: `0 0 0 ${theme.radius.sm}px`,
  },
  progress: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: rem(6),
    backgroundColor: 'transparent',
  },
  fileName: {
    marginTop: rem(4),
    wordBreak: 'break-word',
    fontSize: theme.fontSizes.xs,
    color: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[6],
  },
  fileSize: {
    fontSize: theme.fontSizes.xs,
    color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[5],
  },
}));

// Helper to determine the file type icon
const getFileIcon = (file: FileWithPath) => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (IMAGE_MIME_TYPE.includes(file.type)) {
    return <IconPhoto size={28} />;
  }

  switch (extension) {
    case 'pdf':
      return <IconFilePdf size={28} />;
    case 'doc':
    case 'docx':
    case 'txt':
      return <IconFileText size={28} />;
    case 'xls':
    case 'xlsx':
    case 'csv':
      return <IconFileSpreadsheet size={28} />;
    case 'zip':
    case 'rar':
    case '7z':
      return <IconFileZip size={28} />;
    default:
      return <IconFile size={28} />;
  }
};

// Helper to format file size
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Props for the component
export interface FileUploadProps {
  accept?: DropzoneProps['accept'];
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  value?: FileWithPath[];
  onChange?: (files: FileWithPath[]) => void;
  onUpload?: (files: FileWithPath[]) => Promise<void>;
  uploadProgress?: Record<string, number>;
  previewsPerRow?: number;
  showPreviews?: boolean;
  label?: string;
  description?: string;
  error?: string;
  dropzoneProps?: Partial<DropzoneProps>;
  previewHeight?: number | string;
  style?: CSSObject;
}

/**
 * File upload component with drag and drop, previews, and upload progress
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 10,
  multiple = true,
  value = [],
  onChange,
  onUpload,
  uploadProgress = {},
  previewsPerRow = 4,
  showPreviews = true,
  label = 'Drag files here or click to select files',
  description = 'Upload files by dropping them here or clicking to browse',
  error,
  dropzoneProps,
  previewHeight = 100,
  style,
}) => {
  const { classes, theme } = useStyles();
  const openRef = useRef<() => void>(null);
  const [isOver, setIsOver] = useState(false);
  
  // Function to check if a file is an image
  const isImageFile = (file: FileWithPath) => {
    return IMAGE_MIME_TYPE.includes(file.type);
  };
  
  // Handle file drop
  const handleDrop = (files: FileWithPath[]) => {
    // Restrict to max files
    const newFiles = [...value, ...files].slice(0, maxFiles);
    
    // Animate the file previews
    setTimeout(() => {
      const previews = document.querySelectorAll('.file-preview-new');
      gsap.fromTo(
        previews,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.3, 
          stagger: 0.1,
          ease: 'power2.out',
          onComplete: () => {
            previews.forEach(preview => preview.classList.remove('file-preview-new'));
          }
        }
      );
    }, 100);
    
    if (onChange) {
      onChange(newFiles);
    }
    
    if (onUpload) {
      onUpload(files).catch(console.error);
    }
  };
  
  // Handle drag over state
  const handleDragOver = () => {
    setIsOver(true);
  };
  
  const handleDragLeave = () => {
    setIsOver(false);
  };
  
  // Handle removing a file
  const handleRemove = (index: number) => {
    const newFiles = [...value];
    newFiles.splice(index, 1);
    
    if (onChange) {
      onChange(newFiles);
    }
  };
  
  // Render file previews grid
  const renderPreviews = () => {
    if (!showPreviews || value.length === 0) return null;
    
    return (
      <SimpleGrid
        cols={previewsPerRow}
        spacing="xs"
        breakpoints={[
          { maxWidth: 'md', cols: Math.min(previewsPerRow, 3) },
          { maxWidth: 'sm', cols: Math.min(previewsPerRow, 2) },
          { maxWidth: 'xs', cols: 1 },
        ]}
        mt="md"
      >
        {value.map((file, index) => (
          <Box key={`${file.name}-${index}`} className={`file-preview-new`}>
            <Card className={classes.filePreview} p={0}>
              <div className={classes.fileControls}>
                <ActionIcon 
                  color="red" 
                  size="sm" 
                  onClick={() => handleRemove(index)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </div>
              
              {isImageFile(file) ? (
                <Image
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  height={previewHeight}
                  fit="cover"
                />
              ) : (
                <Group position="center" spacing="xs" py="md" style={{ height: previewHeight }}>
                  {getFileIcon(file)}
                  <Text size="sm" align="center">
                    {file.name.split('.').pop()?.toUpperCase()}
                  </Text>
                </Group>
              )}
              
              {uploadProgress[file.name] !== undefined && (
                <Progress
                  value={uploadProgress[file.name]}
                  className={classes.progress}
                  color={uploadProgress[file.name] < 100 ? 'blue' : 'green'}
                  radius={0}
                />
              )}
            </Card>
            
            <Text className={classes.fileName} title={file.name}>
              {file.name.length > 25 ? `${file.name.slice(0, 20)}...${file.name.slice(-5)}` : file.name}
            </Text>
            
            <Text className={classes.fileSize}>
              {formatBytes(file.size)}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    );
  };
  
  return (
    <div className={classes.wrapper} style={style}>
      <Dropzone
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        maxSize={maxSize}
        accept={accept}
        multiple={multiple}
        disabled={value.length >= maxFiles}
        openRef={openRef}
        className={classes.dropzone}
        {...dropzoneProps}
        styles={{
          root: isOver ? {
            borderColor: theme.colors[theme.primaryColor][6],
            backgroundColor: theme.colorScheme === 'dark' 
              ? theme.fn.rgba(theme.colors[theme.primaryColor][9], 0.1)
              : theme.fn.rgba(theme.colors[theme.primaryColor][0], 0.6),
          } : undefined
        }}
      >
        <div style={{ pointerEvents: 'none' }}>
          <Group position="center">
            <Dropzone.Accept>
              <IconDownload
                size={50}
                stroke={1.5}
                color={theme.colors[theme.primaryColor][6]}
              />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX
                size={50}
                stroke={1.5}
                color={theme.colors.red[6]}
              />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconUpload size={50} stroke={1.5} className={classes.icon} />
            </Dropzone.Idle>
          </Group>

          <Text align="center" weight={700} size="lg" mt="md">
            {label}
          </Text>
          
          <Text align="center" size="sm" mt="xs" color="dimmed">
            {description}
          </Text>
          
          {maxFiles > 0 && (
            <Text align="center" size="xs" mt="xs" color="dimmed">
              {value.length} / {maxFiles} files
            </Text>
          )}
          
          {error && (
            <Text align="center" size="sm" mt="xs" color="red">
              {error}
            </Text>
          )}
        </div>
      </Dropzone>
      
      {renderPreviews()}
    </div>
  );
};

export default FileUpload;