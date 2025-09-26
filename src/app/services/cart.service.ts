// src/app/services/cart.service.ts - VERSIÓN CORREGIDA

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

// IMPORTAR la interface del ProductsService para evitar conflictos
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  stock?: number;
  rating?: number;
  featured?: boolean;
  discount?: number;
  originalPrice?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject: BehaviorSubject<CartItem[]>;
  public cartItems: Observable<CartItem[]>;
  private readonly CART_KEY = 'shopping_cart';

  constructor() {
    this.cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
    this.cartItems = this.cartItemsSubject.asObservable();
    this.loadCart();
  }

  private async loadCart() {
    try {
      const { value } = await Preferences.get({ key: this.CART_KEY });
      if (value) {
        const items = JSON.parse(value);
        console.log('Carrito cargado desde storage:', items);
        this.cartItemsSubject.next(items);
      } else {
        console.log('No hay carrito guardado');
      }
    } catch (error) {
      console.error('Error cargando carrito:', error);
    }
  }

  private async saveCart() {
    try {
      const items = this.cartItemsSubject.value;
      console.log('Guardando carrito:', items);
      await Preferences.set({
        key: this.CART_KEY,
        value: JSON.stringify(items)
      });
      console.log('Carrito guardado exitosamente');
    } catch (error) {
      console.error('Error guardando carrito:', error);
    }
  }

  async addToCart(product: Product, quantity: number = 1) {
    try {
      console.log('=== AGREGANDO AL CARRITO ===');
      console.log('Producto:', product);
      console.log('Cantidad:', quantity);
      
      const currentItems = this.cartItemsSubject.value;
      console.log('Items actuales:', currentItems);
      
      const existingItem = currentItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        console.log('Producto ya existe, aumentando cantidad');
        existingItem.quantity += quantity;
      } else {
        console.log('Nuevo producto, agregando al carrito');
        currentItems.push({ product, quantity });
      }

      console.log('Items después del cambio:', currentItems);
      this.cartItemsSubject.next([...currentItems]);
      await this.saveCart();
      
      console.log('Total items en carrito:', this.getItemCount());
      console.log('=== PRODUCTO AGREGADO EXITOSAMENTE ===');
      
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      throw error;
    }
  }

  async removeFromCart(productId: string) {
    try {
      console.log('Removiendo producto del carrito:', productId);
      const currentItems = this.cartItemsSubject.value.filter(
        item => item.product.id !== productId
      );
      this.cartItemsSubject.next(currentItems);
      await this.saveCart();
      console.log('Producto removido exitosamente');
    } catch (error) {
      console.error('Error removiendo del carrito:', error);
    }
  }

  async updateQuantity(productId: string, quantity: number) {
    try {
      console.log('Actualizando cantidad:', productId, quantity);
      const currentItems = this.cartItemsSubject.value;
      const item = currentItems.find(item => item.product.id === productId);

      if (item) {
        if (quantity <= 0) {
          await this.removeFromCart(productId);
        } else {
          item.quantity = quantity;
          this.cartItemsSubject.next([...currentItems]);
          await this.saveCart();
        }
        console.log('Cantidad actualizada exitosamente');
      } else {
        console.warn('Item no encontrado para actualizar cantidad');
      }
    } catch (error) {
      console.error('Error actualizando cantidad:', error);
    }
  }

  async clearCart() {
    try {
      console.log('Limpiando carrito completo');
      this.cartItemsSubject.next([]);
      await Preferences.remove({ key: this.CART_KEY });
      console.log('Carrito limpiado exitosamente');
    } catch (error) {
      console.error('Error limpiando carrito:', error);
    }
  }

  getTotal(): number {
    const total = this.cartItemsSubject.value.reduce(
      (total, item) => total + (item.product.price * item.quantity), 
      0
    );
    console.log('Total calculado:', total);
    return total;
  }

  getItemCount(): number {
    const count = this.cartItemsSubject.value.reduce(
      (count, item) => count + item.quantity, 
      0
    );
    console.log('Cantidad de items:', count);
    return count;
  }

  getCurrentItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  // Método de debugging
  debugCart() {
    console.log('=== ESTADO ACTUAL DEL CARRITO ===');
    console.log('Items:', this.cartItemsSubject.value);
    console.log('Total items:', this.getItemCount());
    console.log('Total precio:', this.getTotal());
    console.log('================================');
  }
}