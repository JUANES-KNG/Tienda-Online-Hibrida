import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { PhotoService } from '../services/photo.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,  // IMPORTANTE: debe ser false
})
export class Tab2Page implements OnInit {
  cartItemCount: number = 0;

  constructor(
    public photoService: PhotoService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.cartItems.subscribe(() => {
      this.cartItemCount = this.cartService.getItemCount();
    });
  }

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }
}