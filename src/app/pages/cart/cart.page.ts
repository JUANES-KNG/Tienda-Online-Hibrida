import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: false,
})
export class CartPage implements OnInit {
  cartItems: CartItem[] = [];
  total: number = 0;

  constructor(
    public cartService: CartService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.cartService.cartItems.subscribe(items => {
      this.cartItems = items;
      this.total = this.cartService.getTotal();
    });
  }

  async updateQuantity(productId: string, change: number) {
    const item = this.cartItems.find(i => i.product.id === productId);
    if (item) {
      const newQuantity = item.quantity + change;
      await this.cartService.updateQuantity(productId, newQuantity);
    }
  }

  async removeItem(productId: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Deseas eliminar este producto del carrito?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: async () => {
            await this.cartService.removeFromCart(productId);
            await this.showToast('Producto eliminado');
          }
        }
      ]
    });

    await alert.present();
  }

  async clearCart() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Deseas vaciar todo el carrito?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Vaciar',
          handler: async () => {
            await this.cartService.clearCart();
            await this.showToast('Carrito vaciado');
          }
        }
      ]
    });

    await alert.present();
  }

  async checkout() {
    const alert = await this.alertController.create({
      header: 'Confirmar Compra',
      message: `Total a pagar: $${this.total.toFixed(2)}`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async () => {
            await this.cartService.clearCart();
            await this.showToast('¡Compra realizada con éxito!');
          }
        }
      ]
    });

    await alert.present();
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
}