import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  public photos: UserPhoto[] = [];

  constructor() {}

  // Función para tomar foto y agregarla a la galería
  public async addNewToGallery() {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    const savedImageFile = {
      filepath: new Date().getTime() + '.jpeg',
      webviewPath: capturedPhoto.webPath
    };

    // Agregar la foto al inicio del array
    this.photos.unshift(savedImageFile);
  }
}
