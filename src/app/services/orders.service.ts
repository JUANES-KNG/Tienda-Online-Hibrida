// src/app/services/orders-api.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService, ApiResponse } from './api.service';
import { Product } from './products.service';

export interface OrderItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  orderDate: string;
  estimatedDelivery?: string;
  deliveredDate?: string;
  trackingNumber?: string;
  notes?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface PaymentMethod {
  type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay';
  cardNumber?: string; // últimos 4 dígitos
  expiryMonth?: number;
  expiryYear?: number;
  cardHolderName?: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersApiService {
  private readonly endpoint = 'orders';

  constructor(private apiService: ApiService) {}

  // Crear nueva orden
  createOrder(orderData: CreateOrderRequest): Observable<Order> {
    return this.apiService.post<ApiResponse<Order>>(this.endpoint, orderData)
      .pipe(
        map(response => response.data)
      );
  }

  // Obtener órdenes del usuario
  getUserOrders(userId?: string, status?: OrderStatus, limit?: number): Observable<Order[]> {
    const params: any = {};
    if (userId) params.userId = userId;
    if (status) params.status = status;
    if (limit) params.limit = limit;

    return this.apiService.get<ApiResponse<Order[]>>(this.endpoint, params)
      .pipe(
        map(response => response.data)
      );
  }

  // Obtener orden por ID
  getOrderById(orderId: string): Observable<Order> {
    return this.apiService.get<ApiResponse<Order>>(`${this.endpoint}/${orderId}`)
      .pipe(
        map(response => response.data)
      );
  }

  // Actualizar estado de orden
  updateOrderStatus(orderId: string, status: OrderStatus): Observable<Order> {
    return this.apiService.put<ApiResponse<Order>>(`${this.endpoint}/${orderId}/status`, { status })
      .pipe(
        map(response => response.data)
      );
  }

  // Cancelar orden
  cancelOrder(orderId: string, reason?: string): Observable<boolean> {
    return this.apiService.put<ApiResponse<boolean>>(`${this.endpoint}/${orderId}/cancel`, { reason })
      .pipe(
        map(response => response.success)
      );
  }

  // Rastrear orden
  trackOrder(orderId: string): Observable<{
    status: OrderStatus;
    trackingNumber: string;
    trackingUrl?: string;
    updates: Array<{
      status: OrderStatus;
      date: string;
      location?: string;
      description: string;
    }>;
  }> {
    return this.apiService.get<ApiResponse<any>>(`${this.endpoint}/${orderId}/track`)
      .pipe(
        map(response => response.data)
      );
  }

  // Obtener historial de órdenes
  getOrderHistory(userId: string, page: number = 1, limit: number = 20): Observable<{
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const params = { userId, page, limit };
    return this.apiService.get<ApiResponse<any>>(`${this.endpoint}/history`, params)
      .pipe(
        map(response => response.data)
      );
  }

  // Obtener estadísticas de órdenes del usuario
  getOrderStats(userId: string): Observable<{
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    ordersByStatus: Record<OrderStatus, number>;
    monthlySpending: Array<{
      month: string;
      total: number;
    }>;
  }> {
    return this.apiService.get<ApiResponse<any>>(`${this.endpoint}/${userId}/stats`)
      .pipe(
        map(response => response.data)
      );
  }

  // Reordenar (crear nueva orden basada en una existente)
  reorder(orderId: string): Observable<Order> {
    return this.apiService.post<ApiResponse<Order>>(`${this.endpoint}/${orderId}/reorder`, {})
      .pipe(
        map(response => response.data)
      );
  }

  // Obtener direcciones guardadas del usuario
  getUserAddresses(userId: string): Observable<Address[]> {
    return this.apiService.get<ApiResponse<Address[]>>(`users/${userId}/addresses`)
      .pipe(
        map(response => response.data)
      );
  }

  // Guardar nueva dirección
  saveAddress(userId: string, address: Address): Observable<Address> {
    return this.apiService.post<ApiResponse<Address>>(`users/${userId}/addresses`, address)
      .pipe(
        map(response => response.data)
      );
  }

  // Obtener métodos de pago guardados
  getPaymentMethods(userId: string): Observable<PaymentMethod[]> {
    return this.apiService.get<ApiResponse<PaymentMethod[]>>(`users/${userId}/payment-methods`)
      .pipe(
        map(response => response.data)
      );
  }

  // Guardar nuevo método de pago
  savePaymentMethod(userId: string, paymentMethod: PaymentMethod): Observable<PaymentMethod> {
    return this.apiService.post<ApiResponse<PaymentMethod>>(`users/${userId}/payment-methods`, paymentMethod)
      .pipe(
        map(response => response.data)
      );
  }

  // Calcular costo de envío
  calculateShipping(items: OrderItem[], address: Address): Observable<{
    cost: number;
    estimatedDays: number;
    options: Array<{
      name: string;
      cost: number;
      estimatedDays: number;
    }>;
  }> {
    return this.apiService.post<ApiResponse<any>>('shipping/calculate', { items, address })
      .pipe(
        map(response => response.data)
      );
  }

  // Procesar pago
  processPayment(orderId: string, paymentData: {
    paymentMethod: PaymentMethod;
    amount: number;
    currency?: string;
  }): Observable<{
    success: boolean;
    transactionId: string;
    status: 'pending' | 'completed' | 'failed';
    message?: string;
  }> {
    return this.apiService.post<ApiResponse<any>>(`${this.endpoint}/${orderId}/payment`, paymentData)
      .pipe(
        map(response => response.data)
      );
  }

  // Obtener factura/recibo
  getInvoice(orderId: string): Observable<{
    invoiceNumber: string;
    downloadUrl: string;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    issueDate: string;
  }> {
    return this.apiService.get<ApiResponse<any>>(`${this.endpoint}/${orderId}/invoice`)
      .pipe(
        map(response => response.data)
      );
  }
}