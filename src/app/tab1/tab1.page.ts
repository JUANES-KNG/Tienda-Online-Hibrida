import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { CartService, Product } from '../services/cart.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {
  products: Product[] = [
    {
      id: '1',
      name: 'Smartphone XPro',
      price: 599.99,
      image: 'assets/images/iPhone_17_Pro.jpg',
      description: 'Último modelo con cámara de alta resolución'
    },
    {
      id: '2',
      name: 'Laptop UltraBook',
      price: 1299.99,
      image: 'assets/images/Mcbook.jpg',
      description: 'Potente procesador y diseño ultradelgado'
    },
    {
      id: '3',
      name: 'Auriculares Pro',
      price: 199.99,
      image: 'assets/images/Airpods.jpeg',
      description: 'Cancelación de ruido activa'
    },
    {
      id: '4',
      name: 'Smartwatch Elite',
      price: 349.99,
      image: 'assets/images/AppleWatch.jpg',
      description: 'Monitor de salud y fitness avanzado'
    },
    {
      id: '5',
      name: 'Tablet Max',
      price: 799.99,
      image: 'assets/images/Ipad.jpg',
      description: 'Pantalla retina de 12 pulgadas'
    },
    {
      id: '6',
      name: 'Cámara Digital',
      price: 899.99,
      image: 'assets/images/AppleCamera.jpeg',
      description: '24MP con grabación 4K'
    }
  ];

  cartItemCount: number = 0;

  constructor(
    private cartService: CartService,
    private toastController: ToastController,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.cartItems.subscribe(() => {
      this.cartItemCount = this.cartService.getItemCount();
    });
  }

  async addToCart(product: Product) {
    await this.cartService.addToCart(product);
    const toast = await this.toastController.create({
      message: `${product.name} agregado al carrito`,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }
}