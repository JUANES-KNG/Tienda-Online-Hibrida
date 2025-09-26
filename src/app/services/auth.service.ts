import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private readonly STORAGE_KEY = 'currentUser';
  private loadingPromise: Promise<void>;

  constructor() {
    console.log('AuthService constructor iniciado');
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();
    this.loadingPromise = this.loadUser();
  }

  private async loadUser(): Promise<void> {
    try {
      console.log('Cargando usuario desde Preferences...');
      const { value } = await Preferences.get({ key: this.STORAGE_KEY });
      console.log('Valor recuperado:', value);
      if (value) {
        const user = JSON.parse(value);
        console.log('Usuario cargado:', user);
        this.currentUserSubject.next(user);
      } else {
        console.log('No hay usuario guardado');
      }
    } catch (error) {
      console.error('Error cargando usuario:', error);
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      console.log('=== LOGIN SERVICE ===');
      console.log('Email recibido:', email);
      console.log('Password length:', password.length);
      
      await this.loadingPromise;
      console.log('loadingPromise completado');
      
      if (password.length >= 6) {
        const user: User = {
          id: Date.now().toString(),
          email: email,
          name: email.split('@')[0],
          avatar: `https://ui-avatars.com/api/?name=${email}&background=random`
        };

        console.log('Usuario creado:', user);
        console.log('Guardando en Preferences...');
        
        await Preferences.set({
          key: this.STORAGE_KEY,
          value: JSON.stringify(user)
        });
        
        console.log('Usuario guardado exitosamente');
        this.currentUserSubject.next(user);
        console.log('Subject actualizado');
        return true;
      }
      
      console.log('Password muy corta, retornando false');
      return false;
    } catch (error) {
      console.error('Error en login service:', error);
      throw error;
    }
  }

  async register(email: string, password: string, name: string): Promise<boolean> {
    try {
      console.log('=== REGISTER SERVICE ===');
      console.log('Datos recibidos:', { email, password: password.length, name });
      
      await this.loadingPromise;
      console.log('loadingPromise completado');
      
      if (email && password.length >= 6 && name) {
        const user: User = {
          id: Date.now().toString(),
          email: email,
          name: name,
          avatar: `https://ui-avatars.com/api/?name=${name}&background=random`
        };

        console.log('Usuario creado:', user);
        console.log('Guardando en Preferences...');
        
        await Preferences.set({
          key: this.STORAGE_KEY,
          value: JSON.stringify(user)
        });
        
        console.log('Usuario guardado exitosamente');
        this.currentUserSubject.next(user);
        console.log('Subject actualizado');
        return true;
      }
      
      console.log('Datos inválidos, retornando false');
      return false;
    } catch (error) {
      console.error('Error en register service:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    console.log('Cerrando sesión...');
    await Preferences.remove({ key: this.STORAGE_KEY });
    this.currentUserSubject.next(null);
    console.log('Sesión cerrada');
  }

  isAuthenticated(): boolean {
    const auth = this.currentUserValue !== null;
    console.log('isAuthenticated:', auth, 'User:', this.currentUserValue);
    return auth;
  }
}