import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  email: string = '';
  password: string = '';
  isLogin: boolean = true;
  name: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  async onSubmit() {
    if (this.isLogin) {
      await this.login();
    } else {
      await this.register();
    }
  }

  async login() {
    console.log('=== INICIO LOGIN ===');
    console.log('Email:', this.email);
    console.log('Password length:', this.password.length);
    
    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
    });
    await loading.present();

    try {
      console.log('Llamando a authService.login...');
      const success = await this.authService.login(this.email, this.password);
      console.log('Resultado de login:', success);
      
      if (success) {
        console.log('Login exitoso, esperando...');
        await new Promise(resolve => setTimeout(resolve, 100));
        await loading.dismiss();
        console.log('Navegando a /tabs/tab1...');
        await this.router.navigate(['/tabs/tab1']);
        console.log('Navegación completada');
      } else {
        console.log('Login falló - contraseña corta');
        await loading.dismiss();
        await this.showAlert('Error', 'La contraseña debe tener al menos 6 caracteres');
      }
    } catch (error) {
      console.error('=== ERROR EN LOGIN ===');
      console.error('Error completo:', error);
      console.error('Tipo de error:', typeof error);
      console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
      await loading.dismiss();
      await this.showAlert('Error', 'Ocurrió un error: ' + (error instanceof Error ? error.message : JSON.stringify(error)));
    }
  }

  async register() {
    console.log('=== INICIO REGISTRO ===');
    console.log('Nombre:', this.name);
    console.log('Email:', this.email);
    console.log('Password length:', this.password.length);
    
    const loading = await this.loadingController.create({
      message: 'Creando cuenta...',
    });
    await loading.present();

    try {
      console.log('Llamando a authService.register...');
      const success = await this.authService.register(
        this.email,
        this.password,
        this.name
      );
      console.log('Resultado de registro:', success);

      if (success) {
        console.log('Registro exitoso, esperando...');
        await new Promise(resolve => setTimeout(resolve, 100));
        await loading.dismiss();
        console.log('Navegando a /tabs/tab1...');
        await this.router.navigate(['/tabs/tab1']);
        console.log('Navegación completada');
      } else {
        console.log('Registro falló - datos incompletos');
        await loading.dismiss();
        await this.showAlert('Error', 'Completa todos los campos correctamente');
      }
    } catch (error) {
      console.error('=== ERROR EN REGISTRO ===');
      console.error('Error completo:', error);
      console.error('Tipo de error:', typeof error);
      console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
      await loading.dismiss();
      await this.showAlert('Error', 'Ocurrió un error: ' + (error instanceof Error ? error.message : JSON.stringify(error)));
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.email = '';
    this.password = '';
    this.name = '';
  }
}