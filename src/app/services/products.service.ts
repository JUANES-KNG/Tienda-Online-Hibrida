// src/app/services/products.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, filter } from 'rxjs/operators';

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

export interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  featured?: boolean;
  inStock?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();
  
  private categoriesSubject = new BehaviorSubject<string[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  private isLoadedSubject = new BehaviorSubject<boolean>(false);
  public isLoaded$ = this.isLoadedSubject.asObservable();

  // Productos iniciales (migrados desde Tab1)
  private initialProducts: Product[] = [
    {
      id: '1',
      name: 'Smartphone XPro',
      price: 599.99,
      image: 'assets/images/iPhone_17_Pro.jpg',
      description: 'Último modelo con cámara de alta resolución y procesador de última generación',
      category: 'Electronics',
      stock: 25,
      rating: 4.8,
      featured: true
    },
    {
      id: '2',
      name: 'Laptop UltraBook',
      price: 1299.99,
      image: 'assets/images/Mcbook.jpg',
      description: 'Potente procesador y diseño ultradelgado, perfecta para trabajo y entretenimiento',
      category: 'Computers',
      stock: 15,
      rating: 4.9,
      featured: true,
      discount: 10,
      originalPrice: 1444.43
    },
    {
      id: '3',
      name: 'Auriculares Pro',
      price: 199.99,
      image: 'assets/images/Airpods.jpeg',
      description: 'Cancelación de ruido activa y sonido de alta calidad',
      category: 'Audio',
      stock: 50,
      rating: 4.7
    },
    {
      id: '4',
      name: 'Smartwatch Elite',
      price: 349.99,
      image: 'assets/images/AppleWatch.jpg',
      description: 'Monitor de salud y fitness avanzado con GPS integrado',
      category: 'Wearables',
      stock: 30,
      rating: 4.6,
      featured: true
    },
    {
      id: '5',
      name: 'Tablet Max',
      price: 799.99,
      image: 'assets/images/Ipad.jpg',
      description: 'Pantalla retina de 12 pulgadas con soporte para Apple Pencil',
      category: 'Electronics',
      stock: 20,
      rating: 4.8
    },
    {
      id: '6',
      name: 'Cámara Digital',
      price: 899.99,
      image: 'assets/images/AppleCamera.jpeg',
      description: '24MP con grabación 4K y lentes intercambiables',
      category: 'Photography',
      stock: 12,
      rating: 4.9,
      featured: true
    },
    // Productos adicionales para más variedad
    {
      id: '7',
      name: 'Gaming Mouse Pro',
      price: 79.99,
      image: 'assets/images/Mouse_gamer.jpg',
      description: 'Mouse gaming con 12000 DPI y iluminación RGB personalizable',
      category: 'Gaming',
      stock: 75,
      rating: 4.5
    },
    {
      id: '8',
      name: 'Mechanical Keyboard',
      price: 149.99,
      image: 'assets/images/Keyboard.jpg',
      description: 'Teclado mecánico con switches Cherry MX y retroiluminación',
      category: 'Gaming',
      stock: 40,
      rating: 4.7
    },
    {
      id: '9',
      name: 'Wireless Charger',
      price: 39.99,
      image: 'assets/images/WirelessCharger.jpeg',
      description: 'Cargador inalámbrico rápido compatible con Qi',
      category: 'Accessories',
      stock: 100,
      rating: 4.3
    },
    {
      id: '10',
      name: 'Bluetooth Speaker',
      price: 129.99,
      image: 'assets/images/BluetoothSpeaker.jpg',
      description: 'Altavoz portátil resistente al agua con 20 horas de batería',
      category: 'Audio',
      stock: 60,
      rating: 4.6,
      discount: 15,
      originalPrice: 152.93
    }
  ];

  constructor() {
    this.loadProducts();
  }

  // Cargar productos iniciales
  private loadProducts(): void {
    this.productsSubject.next(this.initialProducts);
    this.updateCategories();
    this.isLoadedSubject.next(true);
  }

  // Actualizar categorías basadas en productos
  private updateCategories(): void {
    const products = this.productsSubject.value;
    const categories = [...new Set(products.map(product => product.category))];
    this.categoriesSubject.next(categories);
  }

  // Obtener todos los productos
  getProducts(filters?: ProductFilter): Observable<Product[]> {
    return this.products$.pipe(
      map(products => this.applyFilters(products, filters))
    );
  }

  // Obtener producto por ID
  getProductById(id: string): Observable<Product | undefined> {
    return this.products$.pipe(
      map(products => products.find(product => product.id === id))
    );
  }

  // Obtener categorías
  getCategories(): Observable<string[]> {
    return this.categories$;
  }

  // Obtener productos destacados
  getFeaturedProducts(): Observable<Product[]> {
    return this.products$.pipe(
      map(products => products.filter(product => product.featured))
    );
  }

  // Obtener productos con descuento
  getDiscountedProducts(): Observable<Product[]> {
    return this.products$.pipe(
      map(products => products.filter(product => product.discount && product.discount > 0))
    );
  }

  // Buscar productos
  searchProducts(query: string): Observable<Product[]> {
    if (!query.trim()) {
      return this.products$;
    }

    return this.products$.pipe(
      map(products => products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      ))
    );
  }

  // Obtener productos por categoría
  getProductsByCategory(category: string): Observable<Product[]> {
    return this.products$.pipe(
      map(products => products.filter(product => product.category === category))
    );
  }

  // Obtener productos con stock
  getInStockProducts(): Observable<Product[]> {
    return this.products$.pipe(
      map(products => products.filter(product => 
        product.stock !== undefined && product.stock > 0
      ))
    );
  }

  // Obtener productos por rango de precio
  getProductsByPriceRange(minPrice: number, maxPrice: number): Observable<Product[]> {
    return this.products$.pipe(
      map(products => products.filter(product => 
        product.price >= minPrice && product.price <= maxPrice
      ))
    );
  }

  // Obtener productos mejor calificados
  getTopRatedProducts(limit: number = 10): Observable<Product[]> {
    return this.products$.pipe(
      map(products => products
        .filter(product => product.rating !== undefined)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, limit)
      )
    );
  }

  // Obtener productos más caros
  getMostExpensiveProducts(limit: number = 5): Observable<Product[]> {
    return this.products$.pipe(
      map(products => products
        .sort((a, b) => b.price - a.price)
        .slice(0, limit)
      )
    );
  }

  // Obtener productos más baratos
  getCheapestProducts(limit: number = 5): Observable<Product[]> {
    return this.products$.pipe(
      map(products => products
        .sort((a, b) => a.price - b.price)
        .slice(0, limit)
      )
    );
  }

  // Aplicar filtros
  private applyFilters(products: Product[], filters?: ProductFilter): Product[] {
    if (!filters) return products;

    return products.filter(product => {
      // Filtro por categoría
      if (filters.category && product.category !== filters.category) {
        return false;
      }

      // Filtro por precio mínimo
      if (filters.minPrice !== undefined && product.price < filters.minPrice) {
        return false;
      }

      // Filtro por precio máximo
      if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
        return false;
      }

      // Filtro por búsqueda
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Filtro por productos destacados
      if (filters.featured !== undefined && product.featured !== filters.featured) {
        return false;
      }

      // Filtro por stock
      if (filters.inStock && (!product.stock || product.stock <= 0)) {
        return false;
      }

      return true;
    });
  }

  // Agregar nuevo producto (para futuras funcionalidades admin)
  addProduct(product: Omit<Product, 'id'>): Observable<Product> {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString()
    };

    const currentProducts = this.productsSubject.value;
    const updatedProducts = [...currentProducts, newProduct];
    
    this.productsSubject.next(updatedProducts);
    this.updateCategories();

    return of(newProduct);
  }

  // Actualizar producto
  updateProduct(id: string, updates: Partial<Product>): Observable<Product | null> {
    const currentProducts = this.productsSubject.value;
    const productIndex = currentProducts.findIndex(p => p.id === id);

    if (productIndex === -1) {
      return of(null);
    }

    const updatedProduct = { ...currentProducts[productIndex], ...updates };
    const updatedProducts = [...currentProducts];
    updatedProducts[productIndex] = updatedProduct;

    this.productsSubject.next(updatedProducts);
    this.updateCategories();

    return of(updatedProduct);
  }

  // Eliminar producto
  deleteProduct(id: string): Observable<boolean> {
    const currentProducts = this.productsSubject.value;
    const filteredProducts = currentProducts.filter(p => p.id !== id);

    if (filteredProducts.length === currentProducts.length) {
      return of(false); // Producto no encontrado
    }

    this.productsSubject.next(filteredProducts);
    this.updateCategories();

    return of(true);
  }

  // Actualizar stock de producto
  updateStock(id: string, newStock: number): Observable<boolean> {
    return this.updateProduct(id, { stock: newStock }).pipe(
      map(product => product !== null)
    );
  }

  // Reducir stock (útil para el carrito)
  reduceStock(id: string, quantity: number): Observable<boolean> {
    const currentProducts = this.productsSubject.value;
    const product = currentProducts.find(p => p.id === id);

    if (!product || !product.stock || product.stock < quantity) {
      return of(false);
    }

    return this.updateStock(id, product.stock - quantity);
  }

  // Verificar disponibilidad
  isProductAvailable(id: string, quantity: number = 1): Observable<boolean> {
    return this.getProductById(id).pipe(
      map(product => {
        if (!product) return false;
        if (product.stock === undefined) return true; // Stock ilimitado
        return product.stock >= quantity;
      })
    );
  }

  // Obtener estadísticas de productos
  getProductStats(): Observable<{
    total: number;
    categories: number;
    inStock: number;
    outOfStock: number;
    featured: number;
    averagePrice: number;
    averageRating: number;
  }> {
    return this.products$.pipe(
      map(products => {
        const inStock = products.filter(p => p.stock && p.stock > 0).length;
        const outOfStock = products.filter(p => p.stock === 0).length;
        const featured = products.filter(p => p.featured).length;
        
        const totalPrice = products.reduce((sum, p) => sum + p.price, 0);
        const averagePrice = products.length > 0 ? totalPrice / products.length : 0;
        
        const ratedProducts = products.filter(p => p.rating !== undefined);
        const totalRating = ratedProducts.reduce((sum, p) => sum + (p.rating || 0), 0);
        const averageRating = ratedProducts.length > 0 ? totalRating / ratedProducts.length : 0;

        return {
          total: products.length,
          categories: this.categoriesSubject.value.length,
          inStock,
          outOfStock,
          featured,
          averagePrice: Math.round(averagePrice * 100) / 100,
          averageRating: Math.round(averageRating * 100) / 100
        };
      })
    );
  }

  // Refrescar productos (para pull-to-refresh)
  refreshProducts(): Observable<Product[]> {
    // Simular carga de API
    return new Observable(observer => {
      setTimeout(() => {
        this.loadProducts();
        observer.next(this.productsSubject.value);
        observer.complete();
      }, 1000);
    });
  }
}