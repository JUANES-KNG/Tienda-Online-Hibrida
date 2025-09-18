import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';     
import { IonicModule } from '@ionic/angular';       
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]   
})
export class Tab2Page {
  photos: string[] = [];

  constructor() {}

  async takePhoto() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl, // usamos DataUrl para mostrar fácil en <img>
      source: CameraSource.Camera
    });

    if (image && image.dataUrl) {
      this.photos.unshift(image.dataUrl); // agrega la foto al inicio del array
    }
  }
}
