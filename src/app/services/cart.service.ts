import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
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
    const { value } = await Preferences.get({ key: this.CART_KEY });
    if (value) {
      this.cartItemsSubject.next(JSON.parse(value));
    }
  }

  private async saveCart() {
    await Preferences.set({
      key: this.CART_KEY,
      value: JSON.stringify(this.cartItemsSubject.value)
    });
  }

  async addToCart(product: Product, quantity: number = 1) {
    const currentItems = this.cartItemsSubject.value;
    const existingItem = currentItems.find(item => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      currentItems.push({ product, quantity });
    }

    this.cartItemsSubject.next([...currentItems]);
    await this.saveCart();
  }

  async removeFromCart(productId: string) {
    const currentItems = this.cartItemsSubject.value.filter(
      item => item.product.id !== productId
    );
    this.cartItemsSubject.next(currentItems);
    await this.saveCart();
  }

  async updateQuantity(productId: string, quantity: number) {
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
    }
  }

  async clearCart() {
    this.cartItemsSubject.next([]);
    await Preferences.remove({ key: this.CART_KEY });
  }

  getTotal(): number {
    return this.cartItemsSubject.value.reduce(
      (total, item) => total + (item.product.price * item.quantity), 
      0
    );
  }

  getItemCount(): number {
    return this.cartItemsSubject.value.reduce(
      (count, item) => count + item.quantity, 
      0
    );
  }

  getCurrentItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }
}