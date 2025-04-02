import React, { useState, useRef, useEffect } from 'react';
import { 
  Paper, 
  Title, 
  Group, 
  ActionIcon, 
  Text, 
  Stack, 
  Tabs, 
  Box, 
  Badge, 
  useMantineTheme,
  LoadingOverlay,
  Image,
  Modal,
  Button,
  Card,
  ScrollArea,
  Center,
  Transition,
  Tooltip
} from '@mantine/core';
import { 
  IconFile, 
  IconFilePdf, 
  IconFileText, 
  IconFileInvoice, 
  IconReceipt, 
  IconFileExport, 
  IconDownload, 
  IconEye, 
  IconX, 
  IconChevronLeft, 
  IconChevronRight,
  IconZoomIn,
  IconZoomOut,
  IconFileDescription,
  IconMaximize
} from '@tabler/icons-react';
import gsap from 'gsap';
import { useStaggerAnimation } from '@/hooks/useAnimation';
import { OrderDocument } from '@/types/order';

interface DocumentViewerProps {
  /** Document data */
  documents: OrderDocument[];
  /** Custom class name */
  className?: string;
  /** Called when the user downloads a document */
  onDownload?: (document: OrderDocument) => void;
  /** Called when the user requests to print a document */
  onPrint?: (document: OrderDocument) => void;
  /** Whether to show the document type tabs */
  showTypeTabs?: boolean;
  /** Whether to auto-open the PDF preview */
  autoOpenPreview?: boolean;
}

/**
 * Document Viewer Component
 * 
 * An interactive document viewer for order-related documents with
 * preview functionality, animations, and file management.
 */
export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documents,
  className,
  onDownload,
  onPrint,
  showTypeTabs = true,
  autoOpenPreview = false
}) => {
  const theme = useMantineTheme();
  const [activeType, setActiveType] = useState<string>('all');
  const [previewDoc, setPreviewDoc] = useState<OrderDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const listContainerRef = useStaggerAnimation({
    stagger: 0.05,
    delay: 0.2,
    y: 10
  });
  
  // Auto-open first PDF if enabled
  useEffect(() => {
    if (autoOpenPreview && documents.length > 0) {
      // Find first PDF document
      const pdfDoc = documents.find(doc => doc.mime_type === 'application/pdf');
      if (pdfDoc) {
        setPreviewDoc(pdfDoc);
      }
    }
  }, [documents, autoOpenPreview]);
  
  // Update current index when preview document changes
  useEffect(() => {
    if (previewDoc) {
      const index = documents.findIndex(doc => doc.id === previewDoc.id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [previewDoc, documents]);
  
  // Get all available document types
  const documentTypes = ['all', ...new Set(documents.map(doc => doc.type))];
  
  // Filter documents by active type
  const filteredDocuments = activeType === 'all' 
    ? documents 
    : documents.filter(doc => doc.type === activeType);
  
  // Handle document preview
  const handlePreview = (document: OrderDocument) => {
    setIsLoading(true);
    setPreviewDoc(document);
    
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };
  
  // Handle document download
  const handleDownload = (document: OrderDocument) => {
    if (onDownload) {
      onDownload(document);
    } else {
      // Default download behavior
      window.open(document.file_url, '_blank');
    }
  };
  
  // Navigate between documents
  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!previewDoc) return;
    
    // Animate out current document
    gsap.to('.document-preview', {
      opacity: 0,
      x: direction === 'prev' ? 50 : -50,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        // Update index
        const newIndex = direction === 'prev' 
          ? (currentIndex > 0 ? currentIndex - 1 : documents.length - 1)
          : (currentIndex < documents.length - 1 ? currentIndex + 1 : 0);
        
        setCurrentIndex(newIndex);
        setPreviewDoc(documents[newIndex]);
        setIsLoading(true);
        
        // Simulate loading
        setTimeout(() => {
          setIsLoading(false);
          
          // Animate in new document
          gsap.fromTo('.document-preview', 
            { 
              opacity: 0, 
              x: direction === 'prev' ? -50 : 50 
            }, 
            {
              opacity: 1,
              x: 0,
              duration: 0.3,
              ease: 'power2.out'
            }
          );
        }, 500);
      }
    });
  };
  
  // Get document icon based on type and mime type
  const getDocumentIcon = (doc: OrderDocument) => {
    if (doc.mime_type?.includes('pdf')) {
      return <IconFilePdf size={18} />;
    }
    
    switch (doc.type) {
      case 'invoice':
        return <IconFileInvoice size={18} />;
      case 'receipt':
        return <IconReceipt size={18} />;
      case 'packing_slip':
        return <IconFileDescription size={18} />;
      case 'customs_form':
        return <IconFileText size={18} />;
      case 'return_label':
        return <IconFileExport size={18} />;
      default:
        return <IconFile size={18} />;
    }
  };
  
  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format document type for display
  const formatDocumentType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  // Get document type color
  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'invoice':
        return 'blue';
      case 'packing_slip':
        return 'green';
      case 'customs_form':
        return 'orange';
      case 'receipt':
        return 'cyan';
      case 'return_label':
        return 'red';
      default:
        return 'gray';
    }
  };
  
  // Render document preview content
  const renderPreviewContent = () => {
    if (!previewDoc) return null;
    
    // Handle PDF
    if (previewDoc.mime_type === 'application/pdf') {
      return (
        <iframe 
          src={`${previewDoc.preview_url || previewDoc.file_url}#zoom=${zoomLevel * 100}%`}
          style={{ 
            width: '100%', 
            height: '100%', 
            border: 'none',
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center top'
          }}
          title={previewDoc.title}
        />
      );
    }
    
    // Handle images
    if (previewDoc.mime_type?.includes('image')) {
      return (
        <Center style={{ height: '100%' }}>
          <Image 
            src={previewDoc.preview_url || previewDoc.file_url}
            alt={previewDoc.title}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%',
              transform: `scale(${zoomLevel})`,
              transition: 'transform 0.2s ease-in-out'
            }}
          />
        </Center>
      );
    }
    
    // Handle other types
    return (
      <Center style={{ height: '100%', padding: '2rem' }}>
        <Stack align="center" spacing="md">
          {getDocumentIcon(previewDoc)}
          <Title order={4}>{previewDoc.title}</Title>
          <Text>This file type cannot be previewed.</Text>
          <Button 
            leftIcon={<IconDownload size={16} />}
            onClick={() => handleDownload(previewDoc)}
          >
            Download File
          </Button>
        </Stack>
      </Center>
    );
  };
  
  return (
    <Paper className={className} p="md" radius="md" withBorder>
      <Stack spacing="md">
        <Group position="apart">
          <Title order={4}>Order Documents</Title>
          <Badge size="lg">
            {documents.length} {documents.length === 1 ? 'Document' : 'Documents'}
          </Badge>
        </Group>
        
        {/* Document type tabs */}
        {showTypeTabs && documentTypes.length > 1 && (
          <Tabs value={activeType} onTabChange={setActiveType}>
            <Tabs.List>
              {documentTypes.map(type => (
                <Tabs.Tab 
                  key={type} 
                  value={type}
                  icon={type === 'all' ? <IconFile size={14} /> : getDocumentIcon({ type } as any)}
                >
                  {type === 'all' ? 'All Documents' : formatDocumentType(type)}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>
        )}
        
        {/* Document list */}
        <ScrollArea h={300} offsetScrollbars>
          <Box ref={listContainerRef}>
            {filteredDocuments.length === 0 ? (
              <Text align="center" color="dimmed" py="xl">
                No documents available
              </Text>
            ) : (
              <Stack spacing="xs">
                {filteredDocuments.map((doc, index) => (
                  <Card 
                    key={doc.id} 
                    withBorder 
                    p="sm"
                    radius="md"
                    sx={{
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <Group position="apart" noWrap>
                      <Group spacing="sm" noWrap>
                        {getDocumentIcon(doc)}
                        <div>
                          <Text weight={500} lineClamp={1}>
                            {doc.title}
                          </Text>
                          <Group spacing="xs">
                            <Badge 
                              size="sm" 
                              color={getDocumentTypeColor(doc.type)}
                            >
                              {formatDocumentType(doc.type)}
                            </Badge>
                            <Text size="xs" color="dimmed">
                              {formatFileSize(doc.size)}
                            </Text>
                            <Text size="xs" color="dimmed">
                              {formatDate(doc.created_at)}
                            </Text>
                          </Group>
                        </div>
                      </Group>
                      
                      <Group spacing="xs" noWrap>
                        <Tooltip label="Preview">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => handlePreview(doc)}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Download">
                          <ActionIcon
                            variant="light"
                            color="green"
                            onClick={() => handleDownload(doc)}
                          >
                            <IconDownload size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>
        </ScrollArea>
      </Stack>
      
      {/* Document Preview Modal */}
      <Modal
        opened={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        size="xl"
        title={
          <Group spacing="sm">
            {previewDoc && getDocumentIcon(previewDoc)}
            <Text>{previewDoc?.title}</Text>
          </Group>
        }
        styles={{
          modal: {
            height: 'calc(90vh - 100px)',
            display: 'flex',
            flexDirection: 'column'
          },
          body: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            paddingTop: 0
          },
          header: {
            marginBottom: 0
          }
        }}
      >
        <Box sx={{ position: 'relative', flex: 1 }}>
          <LoadingOverlay visible={isLoading} />
          
          {/* Navigation buttons */}
          {documents.length > 1 && (
            <>
              <ActionIcon
                sx={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10
                }}
                radius="xl"
                variant="filled"
                color="gray"
                onClick={() => handleNavigate('prev')}
              >
                <IconChevronLeft size={18} />
              </ActionIcon>
              
              <ActionIcon
                sx={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10
                }}
                radius="xl"
                variant="filled"
                color="gray"
                onClick={() => handleNavigate('next')}
              >
                <IconChevronRight size={18} />
              </ActionIcon>
            </>
          )}
          
          {/* Document content */}
          <Box 
            className="document-preview" 
            sx={{ 
              height: '100%', 
              overflow: 'auto',
              padding: documents.length > 1 ? '0 50px' : 0
            }}
          >
            {renderPreviewContent()}
          </Box>
          
          {/* Controls */}
          <Paper 
            p="xs" 
            sx={{ 
              position: 'absolute', 
              bottom: 10, 
              left: '50%', 
              transform: 'translateX(-50%)',
              zIndex: 10,
              borderRadius: theme.radius.xl
            }}
            shadow="md"
          >
            <Group spacing="xs">
              <ActionIcon
                size="lg"
                variant="light"
                disabled={zoomLevel <= 0.5}
                onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
                title="Zoom out"
              >
                <IconZoomOut size={18} />
              </ActionIcon>
              
              <Text size="sm" align="center" sx={{ minWidth: 50 }}>
                {Math.round(zoomLevel * 100)}%
              </Text>
              
              <ActionIcon
                size="lg"
                variant="light"
                disabled={zoomLevel >= 2}
                onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.25))}
                title="Zoom in"
              >
                <IconZoomIn size={18} />
              </ActionIcon>
              
              <ActionIcon
                size="lg"
                variant="light"
                onClick={() => setZoomLevel(1)}
                title="Reset zoom"
              >
                <IconMaximize size={18} />
              </ActionIcon>
              
              <ActionIcon
                size="lg"
                variant="light"
                color="green"
                onClick={() => handleDownload(previewDoc!)}
                title="Download"
              >
                <IconDownload size={18} />
              </ActionIcon>
            </Group>
          </Paper>
        </Box>
      </Modal>
    </Paper>
  );
};

export default DocumentViewer;