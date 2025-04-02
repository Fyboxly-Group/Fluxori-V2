import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import OrderService, {
  Order,
  OrderFilterParams,
  OrderStatus,
  Shipment,
  OrderDocument,
  OrderItem
} from '@/api/services/order.service';

/**
 * Hook for managing orders
 */
export function useOrders(filters: OrderFilterParams = {}) {
  const queryClient = useQueryClient();
  
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['orders', filters],
    queryFn: () => OrderService.getOrders(filters)
  });
  
  const createOrderMutation = useMutation({
    mutationFn: (orderData: Partial<Order>) => OrderService.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });
  
  const updateOrderMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Order> }) => 
      OrderService.updateOrder(id, data),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', updatedOrder.id] });
    }
  });
  
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: OrderStatus; note?: string }) => 
      OrderService.updateOrderStatus(id, status, note),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', updatedOrder.id] });
    }
  });
  
  const deleteOrderMutation = useMutation({
    mutationFn: (orderId: string) => OrderService.deleteOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });
  
  const cancelOrderMutation = useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) => 
      OrderService.cancelOrder(orderId, reason),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', updatedOrder.id] });
    }
  });
  
  return {
    orders: data?.items || [],
    totalOrders: data?.total || 0,
    pagination: {
      page: data?.page || 1,
      pageSize: data?.pageSize || 10,
      totalPages: data?.totalPages || 1
    },
    isLoading,
    error,
    refetch,
    createOrder: createOrderMutation.mutateAsync,
    updateOrder: updateOrderMutation.mutateAsync,
    updateOrderStatus: updateOrderStatusMutation.mutateAsync,
    deleteOrder: deleteOrderMutation.mutateAsync,
    cancelOrder: cancelOrderMutation.mutateAsync,
    isCreating: createOrderMutation.isPending,
    isUpdating: updateOrderMutation.isPending || updateOrderStatusMutation.isPending,
    isDeleting: deleteOrderMutation.isPending,
    isCancelling: cancelOrderMutation.isPending
  };
}

/**
 * Hook for a specific order
 */
export function useOrder(orderId: string) {
  const queryClient = useQueryClient();
  
  const {
    data: order,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => OrderService.getOrder(orderId),
    enabled: !!orderId
  });
  
  const updateOrderMutation = useMutation({
    mutationFn: (orderData: Partial<Order>) => OrderService.updateOrder(orderId, orderData),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });
  
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ status, note }: { status: OrderStatus; note?: string }) => 
      OrderService.updateOrderStatus(orderId, status, note),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });
  
  const addOrderNoteMutation = useMutation({
    mutationFn: (note: string) => OrderService.addOrderNote(orderId, note),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    }
  });
  
  const addOrderItemMutation = useMutation({
    mutationFn: (item: Partial<OrderItem>) => OrderService.addOrderItem(orderId, item),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    }
  });
  
  const updateOrderItemMutation = useMutation({
    mutationFn: ({ itemId, item }: { itemId: string; item: Partial<OrderItem> }) => 
      OrderService.updateOrderItem(orderId, itemId, item),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    }
  });
  
  const removeOrderItemMutation = useMutation({
    mutationFn: (itemId: string) => OrderService.removeOrderItem(orderId, itemId),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    }
  });
  
  const cancelOrderMutation = useMutation({
    mutationFn: (reason: string) => OrderService.cancelOrder(orderId, reason),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });
  
  const processRefundMutation = useMutation({
    mutationFn: (refundData: {
      amount: number;
      reason: string;
      items?: { itemId: string; quantity: number }[];
      restockItems?: boolean;
    }) => OrderService.processRefund(orderId, refundData),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });
  
  const generateInvoiceMutation = useMutation({
    mutationFn: () => OrderService.generateInvoice(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-documents', orderId] });
    }
  });
  
  const generatePackingSlipMutation = useMutation({
    mutationFn: () => OrderService.generatePackingSlip(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-documents', orderId] });
    }
  });
  
  return {
    order,
    isLoading,
    error,
    refetch,
    updateOrder: updateOrderMutation.mutateAsync,
    updateOrderStatus: updateOrderStatusMutation.mutateAsync,
    addOrderNote: addOrderNoteMutation.mutateAsync,
    addOrderItem: addOrderItemMutation.mutateAsync,
    updateOrderItem: updateOrderItemMutation.mutateAsync,
    removeOrderItem: removeOrderItemMutation.mutateAsync,
    cancelOrder: cancelOrderMutation.mutateAsync,
    processRefund: processRefundMutation.mutateAsync,
    generateInvoice: generateInvoiceMutation.mutateAsync,
    generatePackingSlip: generatePackingSlipMutation.mutateAsync,
    isUpdating: updateOrderMutation.isPending || updateOrderStatusMutation.isPending,
    isAddingNote: addOrderNoteMutation.isPending,
    isModifyingItems: addOrderItemMutation.isPending || updateOrderItemMutation.isPending || removeOrderItemMutation.isPending,
    isCancelling: cancelOrderMutation.isPending,
    isProcessingRefund: processRefundMutation.isPending,
    isGeneratingInvoice: generateInvoiceMutation.isPending,
    isGeneratingPackingSlip: generatePackingSlipMutation.isPending,
    invoiceUrl: generateInvoiceMutation.data?.url,
    packingSlipUrl: generatePackingSlipMutation.data?.url
  };
}

/**
 * Hook for order documents
 */
export function useOrderDocuments(orderId: string) {
  const queryClient = useQueryClient();
  
  const {
    data: documents,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['order-documents', orderId],
    queryFn: () => OrderService.getOrderDocuments(orderId),
    enabled: !!orderId
  });
  
  const uploadDocumentMutation = useMutation({
    mutationFn: (document: {
      type: 'invoice' | 'receipt' | 'shipping_label' | 'packing_slip' | 'return_label' | 'other';
      name: string;
      file: File;
    }) => OrderService.uploadOrderDocument(orderId, document),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-documents', orderId] });
    }
  });
  
  const deleteDocumentMutation = useMutation({
    mutationFn: (documentId: string) => OrderService.deleteOrderDocument(orderId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-documents', orderId] });
    }
  });
  
  return {
    documents: documents || [],
    isLoading,
    error,
    refetch,
    uploadDocument: uploadDocumentMutation.mutateAsync,
    deleteDocument: deleteDocumentMutation.mutateAsync,
    isUploading: uploadDocumentMutation.isPending,
    isDeleting: deleteDocumentMutation.isPending
  };
}

/**
 * Hook for order shipments
 */
export function useOrderShipments(orderId: string) {
  const queryClient = useQueryClient();
  
  const {
    data: shipments,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['order-shipments', orderId],
    queryFn: () => OrderService.getOrderShipments(orderId),
    enabled: !!orderId
  });
  
  const createShipmentMutation = useMutation({
    mutationFn: (shipmentData: Partial<Shipment>) => OrderService.createShipment(orderId, shipmentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-shipments', orderId] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    }
  });
  
  return {
    shipments: shipments || [],
    isLoading,
    error,
    refetch,
    createShipment: createShipmentMutation.mutateAsync,
    isCreating: createShipmentMutation.isPending
  };
}

/**
 * Hook for a specific shipment
 */
export function useShipment(shipmentId: string) {
  const queryClient = useQueryClient();
  
  const {
    data: shipment,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['shipment', shipmentId],
    queryFn: () => OrderService.getShipment(shipmentId),
    enabled: !!shipmentId
  });
  
  const updateShipmentMutation = useMutation({
    mutationFn: (shipmentData: Partial<Shipment>) => OrderService.updateShipment(shipmentId, shipmentData),
    onSuccess: (updatedShipment) => {
      queryClient.invalidateQueries({ queryKey: ['shipment', shipmentId] });
      if (updatedShipment.orderId) {
        queryClient.invalidateQueries({ queryKey: ['order-shipments', updatedShipment.orderId] });
        queryClient.invalidateQueries({ queryKey: ['order', updatedShipment.orderId] });
      }
    }
  });
  
  const updateShipmentStatusMutation = useMutation({
    mutationFn: (status: string) => OrderService.updateShipmentStatus(shipmentId, status),
    onSuccess: (updatedShipment) => {
      queryClient.invalidateQueries({ queryKey: ['shipment', shipmentId] });
      if (updatedShipment.orderId) {
        queryClient.invalidateQueries({ queryKey: ['order-shipments', updatedShipment.orderId] });
        queryClient.invalidateQueries({ queryKey: ['order', updatedShipment.orderId] });
      }
    }
  });
  
  const addTrackingMutation = useMutation({
    mutationFn: (trackingInfo: { trackingNumber: string; carrier: string; serviceType?: string }) => 
      OrderService.addShipmentTracking(shipmentId, trackingInfo),
    onSuccess: (updatedShipment) => {
      queryClient.invalidateQueries({ queryKey: ['shipment', shipmentId] });
      if (updatedShipment.orderId) {
        queryClient.invalidateQueries({ queryKey: ['order-shipments', updatedShipment.orderId] });
      }
    }
  });
  
  const generateLabelMutation = useMutation({
    mutationFn: () => OrderService.generateShippingLabel(shipmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipment', shipmentId] });
    }
  });
  
  return {
    shipment,
    isLoading,
    error,
    refetch,
    updateShipment: updateShipmentMutation.mutateAsync,
    updateShipmentStatus: updateShipmentStatusMutation.mutateAsync,
    addTracking: addTrackingMutation.mutateAsync,
    generateLabel: generateLabelMutation.mutateAsync,
    isUpdating: updateShipmentMutation.isPending || updateShipmentStatusMutation.isPending,
    isAddingTracking: addTrackingMutation.isPending,
    isGeneratingLabel: generateLabelMutation.isPending,
    labelUrl: generateLabelMutation.data?.labelUrl
  };
}

/**
 * Hook for shipping rates
 */
export function useShippingRates(orderId: string, params: {
  destinationZip?: string;
  destinationCountry?: string;
} = {}) {
  const {
    data: rates,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['shipping-rates', orderId, params],
    queryFn: () => OrderService.getShippingRates(orderId, params),
    enabled: !!orderId
  });
  
  return {
    rates: rates || [],
    isLoading,
    error,
    refetch
  };
}

/**
 * Hook for order summary metrics
 */
export function useOrderSummary(params: {
  dateFrom?: string;
  dateTo?: string;
  marketplace?: string;
} = {}) {
  const {
    data: summary,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['order-summary', params],
    queryFn: () => OrderService.getOrderSummary(params)
  });
  
  return {
    summary,
    isLoading,
    error,
    refetch
  };
}

/**
 * Hook for exporting orders
 */
export function useOrderExport() {
  const exportOrdersMutation = useMutation({
    mutationFn: ({ format, filters }: { format: 'csv' | 'pdf'; filters?: OrderFilterParams }) => 
      OrderService.exportOrders(format, filters)
  });
  
  return {
    exportOrders: exportOrdersMutation.mutateAsync,
    isExporting: exportOrdersMutation.isPending,
    exportUrl: exportOrdersMutation.data?.url,
    error: exportOrdersMutation.error
  };
}