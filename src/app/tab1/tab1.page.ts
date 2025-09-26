// src/app/tab1/tab1.page.ts - FILTROS CORREGIDOS

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, AlertController, LoadingController, ActionSheetController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { CartService } from '../services/cart.service';
import { ProductsService, Product, ProductFilter } from '../services/products.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit, OnDestroy {
  // Productos y categorías
  products: Product[] = [];
  allProducts: Product[] = []; // Para restaurar después de filtros
  categories: string[] = [];
  
  // Filtros básicos
  selectedCategory: string = '';
  searchTerm: string = '';
  
  // Filtros avanzados
  showFilters: boolean = false;
  priceRange: { lower: number; upper: number } = { lower: 0, upper: 2000 };
  showOnlyInStock: boolean = false;
  showOnlyFeatured: boolean = false;
  showOnlyDiscounted: boolean = false;
  
  // Estados
  cartItemCount: number = 0;
  isLoading: boolean = false;
  isRefreshing: boolean = false;
  
  // Estadísticas
  productStats: any = null;
  
  // Vista
  viewMode: 'grid' | 'list' = 'grid';
  sortBy: 'name' | 'price' | 'rating' | 'newest' = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  private subscriptions: Subscription[] = [];

  constructor(
    private cartService: CartService,
    private productsService: ProductsService,
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private actionSheetController: ActionSheetController,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('Tab1 - ngOnInit iniciado');
    this.subscribeToServices();
    this.loadInitialData();
  }

  ngOnDestroy() {
    console.log('Tab1 - ngOnDestroy');
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private subscribeToServices() {
    // Carrito
    const cartSub = this.cartService.cartItems.subscribe(() => {
      this.cartItemCount = this.cartService.getItemCount();
    });
    this.subscriptions.push(cartSub);

    // Categorías
    const categoriesSub = this.productsService.categories$.subscribe(categories => {
      this.categories = categories;
      console.log('Categorías cargadas:', categories);
    });
    this.subscriptions.push(categoriesSub);

    // Estadísticas
    const statsSub = this.productsService.getProductStats().subscribe(stats => {
      this.productStats = stats;
    });
    this.subscriptions.push(statsSub);
  }

  private loadInitialData() {
    this.loadAllProducts();
  }

  // ============ CARGA DE PRODUCTOS ============
  
  loadAllProducts() {
    this.isLoading = true;
    
    const productsSub = this.productsService.getProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
        this.products = [...products];
        this.isLoading = false;
        this.sortProducts();
        console.log('Todos los productos cargados:', products.length);
        this.debugProductsStock(); // Debug para verificar stock
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
        this.showErrorToast('Error al cargar productos');
      }
    });
    
    this.subscriptions.push(productsSub);
  }

  // Debug para verificar el stock de los productos
  private debugProductsStock() {
    console.log('=== DEBUG STOCK ===');
    this.allProducts.forEach(product => {
      console.log(`${product.name}: stock = ${product.stock}, tipo: ${typeof product.stock}`);
    });
  }

  // ============ FILTROS CORREGIDOS ============

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value;
    this.debounceSearch();
  }

  private searchTimeout: any;
  private debounceSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.applyAllFilters();
    }, 500);
  }

  onCategoryChange(event: any) {
    this.selectedCategory = event.detail.value;
    this.applyAllFilters();
  }

  onPriceRangeChange(event: any) {
    this.priceRange = event.detail.value;
    this.applyAllFilters();
  }

  onInStockToggleChange(event: any) {
  console.log('=== IN STOCK TOGGLE CHANGE ===');
  console.log('Event:', event.detail);
  this.showOnlyInStock = event.detail.checked;
  console.log('Nuevo valor:', this.showOnlyInStock);
  
  // Aplicar filtros inmediatamente
  this.applyAllFilters();
}

onFeaturedToggleChange(event: any) {
  console.log('=== FEATURED TOGGLE CHANGE ===');
  console.log('Event:', event.detail);
  this.showOnlyFeatured = event.detail.checked;
  console.log('Nuevo valor:', this.showOnlyFeatured);
  
  // Aplicar filtros inmediatamente
  this.applyAllFilters();
}

onDiscountedToggleChange(event: any) {
  console.log('=== DISCOUNTED TOGGLE CHANGE ===');
  console.log('Event:', event.detail);
  this.showOnlyDiscounted = event.detail.checked;
  console.log('Nuevo valor:', this.showOnlyDiscounted);
  
  // Aplicar filtros inmediatamente
  this.applyAllFilters();
}

  // FILTROS CORREGIDOS - La clave está aquí
  toggleInStock() {
    console.log('=== TOGGLE IN STOCK ===');
    console.log('Antes:', this.showOnlyInStock);
    this.showOnlyInStock = !this.showOnlyInStock;
    console.log('Después:', this.showOnlyInStock);
    
    // Aplicar filtros inmediatamente
    this.applyAllFilters();
  }

  toggleFeatured() {
    console.log('=== TOGGLE FEATURED ===');
    console.log('Antes:', this.showOnlyFeatured);
    this.showOnlyFeatured = !this.showOnlyFeatured;
    console.log('Después:', this.showOnlyFeatured);
    
    // Aplicar filtros inmediatamente
    this.applyAllFilters();
  }

  toggleDiscounted() {
    console.log('=== TOGGLE DISCOUNTED ===');
    console.log('Antes:', this.showOnlyDiscounted);
    this.showOnlyDiscounted = !this.showOnlyDiscounted;
    console.log('Después:', this.showOnlyDiscounted);
    
    // Aplicar filtros inmediatamente
    this.applyAllFilters();
  }

  // MÉTODO PRINCIPAL DE FILTROS - CORREGIDO
  private applyAllFilters() {
    console.log('=== APLICANDO FILTROS ===');
    console.log('Filtros activos:', {
      category: this.selectedCategory,
      search: this.searchTerm,
      priceRange: this.priceRange,
      inStock: this.showOnlyInStock,
      featured: this.showOnlyFeatured,
      discounted: this.showOnlyDiscounted
    });

    // Empezar con todos los productos
    let filteredProducts = [...this.allProducts];
    
    // 1. Filtro por categoría
    if (this.selectedCategory) {
      filteredProducts = filteredProducts.filter(product => 
        product.category === this.selectedCategory
      );
      console.log(`Después de filtro categoría: ${filteredProducts.length} productos`);
    }
    
    // 2. Filtro por búsqueda
    if (this.searchTerm?.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower)
      );
      console.log(`Después de filtro búsqueda: ${filteredProducts.length} productos`);
    }
    
    // 3. Filtro por rango de precio
    if (this.priceRange.lower > 0 || this.priceRange.upper < 2000) {
      filteredProducts = filteredProducts.filter(product =>
        product.price >= this.priceRange.lower && product.price <= this.priceRange.upper
      );
      console.log(`Después de filtro precio: ${filteredProducts.length} productos`);
    }
    
    // 4. Filtro por stock - CORREGIDO
    if (this.showOnlyInStock) {
      filteredProducts = filteredProducts.filter(product => {
        // Verificar que el producto tenga stock y sea mayor a 0
        const hasStock = product.stock !== undefined && 
                         product.stock !== null && 
                         product.stock > 0;
        console.log(`${product.name}: stock=${product.stock}, hasStock=${hasStock}`);
        return hasStock;
      });
      console.log(`Después de filtro stock: ${filteredProducts.length} productos`);
    }
    
    // 5. Filtro por destacados - CORREGIDO
    if (this.showOnlyFeatured) {
      filteredProducts = filteredProducts.filter(product => {
        const isFeatured = product.featured === true;
        console.log(`${product.name}: featured=${product.featured}, isFeatured=${isFeatured}`);
        return isFeatured;
      });
      console.log(`Después de filtro destacados: ${filteredProducts.length} productos`);
    }
    
    // 6. Filtro por descuento - CORREGIDO
    if (this.showOnlyDiscounted) {
      filteredProducts = filteredProducts.filter(product => {
        const hasDiscount = product.discount !== undefined && 
                           product.discount !== null && 
                           product.discount > 0;
        console.log(`${product.name}: discount=${product.discount}, hasDiscount=${hasDiscount}`);
        return hasDiscount;
      });
      console.log(`Después de filtro descuento: ${filteredProducts.length} productos`);
    }
    
    // Actualizar productos mostrados
    this.products = filteredProducts;
    this.sortProducts();
    
    console.log(`RESULTADO FINAL: ${this.products.length} productos`);
  }

  // Método usando el servicio (alternativo, por si quieres usarlo)
  private applyFiltersUsingService() {
    const filters: ProductFilter = {};
    
    if (this.selectedCategory) {
      filters.category = this.selectedCategory;
    }
    
    if (this.searchTerm?.trim()) {
      filters.search = this.searchTerm.trim();
    }
    
    if (this.priceRange.lower > 0) {
      filters.minPrice = this.priceRange.lower;
    }
    
    if (this.priceRange.upper < 2000) {
      filters.maxPrice = this.priceRange.upper;
    }
    
    if (this.showOnlyInStock) {
      filters.inStock = true;
    }
    
    if (this.showOnlyFeatured) {
      filters.featured = true;
    }
    
    // Usar el servicio para filtrar
    const productsSub = this.productsService.getProducts(filters).subscribe({
      next: (products) => {
        // Aplicar filtro de descuento manualmente (si no está en el servicio)
        let filteredProducts = products;
        
        if (this.showOnlyDiscounted) {
          filteredProducts = products.filter(product => 
            product.discount !== undefined && product.discount > 0
          );
        }
        
        this.products = filteredProducts;
        this.sortProducts();
        console.log('Productos filtrados con servicio:', this.products.length);
      },
      error: (error) => {
        console.error('Error filtering products:', error);
      }
    });
    
    this.subscriptions.push(productsSub);
  }

  clearFilters() {
    console.log('=== LIMPIANDO FILTROS ===');
    this.selectedCategory = '';
    this.searchTerm = '';
    this.priceRange = { lower: 0, upper: 2000 };
    this.showOnlyInStock = false;
    this.showOnlyFeatured = false;
    this.showOnlyDiscounted = false;
    
    // Restaurar todos los productos
    this.products = [...this.allProducts];
    this.sortProducts();
    
    this.showSuccessToast('Filtros limpiados');
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  // ============ FILTROS RÁPIDOS ============

  loadFeaturedProducts() {
    this.clearFilters();
    this.showOnlyFeatured = true;
    this.applyAllFilters();
    this.showSuccessToast('Productos destacados cargados');
  }

  loadDiscountedProducts() {
    this.clearFilters();
    this.showOnlyDiscounted = true;
    this.applyAllFilters();
    this.showSuccessToast('Ofertas cargadas');
  }

  loadTopRatedProducts() {
    this.isLoading = true;
    const topRatedSub = this.productsService.getTopRatedProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.isLoading = false;
        this.sortProducts();
        this.showSuccessToast('Productos mejor calificados');
      },
      error: (error) => {
        console.error('Error:', error);
        this.isLoading = false;
        this.showErrorToast('Error al cargar productos populares');
      }
    });
    this.subscriptions.push(topRatedSub);
  }

  loadCheapestProducts() {
    this.isLoading = true;
    const cheapSub = this.productsService.getCheapestProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.isLoading = false;
        this.sortProducts();
        this.showSuccessToast('Productos más económicos');
      },
      error: (error) => {
        console.error('Error:', error);
        this.isLoading = false;
        this.showErrorToast('Error al cargar productos económicos');
      }
    });
    this.subscriptions.push(cheapSub);
  }

  // ============ ORDENAMIENTO ============

  async showSortOptions() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Ordenar por',
      buttons: [
        {
          text: 'Nombre (A-Z)',
          icon: 'text-outline',
          handler: () => {
            this.sortBy = 'name';
            this.sortDirection = 'asc';
            this.sortProducts();
          }
        },
        {
          text: 'Nombre (Z-A)',
          icon: 'text-outline',
          handler: () => {
            this.sortBy = 'name';
            this.sortDirection = 'desc';
            this.sortProducts();
          }
        },
        {
          text: 'Precio (Menor a Mayor)',
          icon: 'arrow-up-outline',
          handler: () => {
            this.sortBy = 'price';
            this.sortDirection = 'asc';
            this.sortProducts();
          }
        },
        {
          text: 'Precio (Mayor a Menor)',
          icon: 'arrow-down-outline',
          handler: () => {
            this.sortBy = 'price';
            this.sortDirection = 'desc';
            this.sortProducts();
          }
        },
        {
          text: 'Mejor Calificados',
          icon: 'star-outline',
          handler: () => {
            this.sortBy = 'rating';
            this.sortDirection = 'desc';
            this.sortProducts();
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  private sortProducts() {
    this.products.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
      }
      
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  // ============ RESTO DE MÉTODOS (sin cambios) ============


async addToCart(product: Product, event?: Event) {
  if (event) {
    event.stopPropagation();
  }

  try {
    console.log('=== INTENTANDO AGREGAR AL CARRITO ===');
    console.log('Producto a agregar:', product);

    // COMENTAR TEMPORALMENTE la verificación de disponibilidad
    // para ver si es lo que está causando el problema
    
    /* 
    console.log('Verificando disponibilidad...');
    const isAvailable = await this.productsService.isProductAvailable(product.id, 1).toPromise();
    console.log('Disponibilidad:', isAvailable);
    
    if (!isAvailable) {
      console.log('Producto no disponible');
      await this.showErrorToast('Producto sin stock disponible');
      return;
    }
    */

    // VERIFICACIÓN SIMPLE DE STOCK (sin usar el servicio)
    console.log('Verificando stock simple...');
    if (product.stock !== undefined && product.stock <= 0) {
      console.log('Sin stock - stock:', product.stock);
      await this.showErrorToast('Producto sin stock disponible');
      return;
    }
    console.log('Stock OK - stock:', product.stock);

    // Agregar al carrito DIRECTAMENTE
    console.log('Agregando al carrito...');
    await this.cartService.addToCart(product);
    console.log('Producto agregado exitosamente al carrito');
    
    // Mostrar confirmación
    console.log('Mostrando toast de confirmación...');
    const toast = await this.toastController.create({
      message: `${product.name} agregado al carrito`,
      duration: 2000,
      position: 'bottom',
      color: 'success',
      buttons: [
        {
          text: 'Ver carrito',
          handler: () => {
            this.goToCart();
          }
        }
      ]
    });
    await toast.present();
    console.log('Toast mostrado');
    
    // Debug del carrito
    this.cartService.debugCart();
    
  } catch (error) {
    console.error('=== ERROR AGREGANDO AL CARRITO ===');
    console.error('Error completo:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
    await this.showErrorToast(`Error al agregar al carrito: ${error}`);
  }
}

  async viewProductDetails(product: Product) {
    // Preparar el texto sin HTML complejo
    let message = `
      Precio: $${product.price.toFixed(2)}
      `;

    if (product.discount) {
      message += `
      🎉 Descuento: ${product.discount}% OFF
      Precio original: $${product.originalPrice?.toFixed(2)}
      `;
    }

    message += `
      📂 Categoría: ${product.category}
      📦 Stock: ${product.stock || 'Ilimitado'} unidades`;

    if (product.rating) {
      message += `
      ⭐ Rating: ${product.rating}/5`;
    }

    if (product.featured) {
      message += `
      ✨ Producto Destacado`;
    }

    message += `
      
      📝 Descripción:
      ${product.description}`;

    const alert = await this.alertController.create({
      header: product.name,
      message: message,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Agregar al carrito',
          handler: () => {
            this.addToCart(product);
          }
        }
      ]
    });

    await alert.present();
  }

  async refreshProducts(event?: any) {
    this.isRefreshing = true;
    
    try {
      const refreshSub = this.productsService.refreshProducts().subscribe({
        next: (products) => {
          this.allProducts = products;
          this.products = [...products];
          this.sortProducts();
          this.isRefreshing = false;
          this.showSuccessToast('Productos actualizados');
          if (event) event.target.complete();
        },
        error: (error) => {
          console.error('Error refreshing:', error);
          this.isRefreshing = false;
          this.showErrorToast('Error al actualizar');
          if (event) event.target.complete();
        }
      });
      this.subscriptions.push(refreshSub);
    } catch (error) {
      this.isRefreshing = false;
      if (event) event.target.complete();
    }
  }

  async showStats() {
    if (!this.productStats) return;

    // Texto simple sin HTML
    const message = `
      📱 Total: ${this.productStats.total} productos
      📂 Categorías: ${this.productStats.categories}
      ✅ En stock: ${this.productStats.inStock}
      ❌ Sin stock: ${this.productStats.outOfStock}
      ⭐ Destacados: ${this.productStats.featured}
      💰 Precio promedio: $${this.productStats.averagePrice}
      🏆 Rating promedio: ${this.productStats.averageRating}/5`;

    const alert = await this.alertController.create({
      header: '📊 Estadísticas de Productos',
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }

  getDiscountPrice(product: Product): number {
    if (!product.discount) return product.price;
    return product.price;
  }

  getOriginalPrice(product: Product): number | undefined {
    return product.originalPrice;
  }

  isProductNew(product: Product): boolean {
    return product.featured || false;
  }

  getStockStatus(product: Product): string {
    if (!product.stock) return 'Disponible';
    if (product.stock > 10) return 'En stock';
    if (product.stock > 0) return 'Pocas unidades';
    return 'Sin stock';
  }

  getStockColor(product: Product): string {
    if (!product.stock) return 'success';
    if (product.stock > 10) return 'success';
    if (product.stock > 0) return 'warning';
    return 'danger';
  }

  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'success',
      icon: 'checkmark-circle-outline'
    });
    await toast.present();
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'danger',
      icon: 'alert-circle-outline'
    });
    await toast.present();
  }
}