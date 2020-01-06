import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage';
import { ToastController } from 'ionic-angular';
import { Media, MediaObject } from '@ionic-native/media';

/*
  Generated class for the GlobalProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class GlobalProvider {

  categorieList: any;
  expressoList: any;
  expressoListCache: any;
  urlLocal: any;
  public song: MediaObject;
  isReading: number = -1;
  selectedCategorieName: string = 'Tout';

  constructor(
              public http: HttpClient,
              public nativeStorage: NativeStorage,
              public toastCtrl: ToastController,
            ) 
  {
    console.log('Hello GlobalProvider Provider');
    
  }

  loadOfflineVar(){
    this.nativeGet('ns_urlLocal','urlLocal');
    this.nativeGet('ns_expressoList','expressoList');
    this.nativeGet('ns_expressoList','expressoListCache');
    this.nativeGet('ns_categorieList', 'categorieList');
  }

  
  nativeSave(item: string, value: any){
      this.nativeStorage.setItem(item, value)
    .then(
      () => { console.log(item+' sauvegardé!');},
      error => console.error(' ERROR Native storage: '+item, error)
    );
  }

  private nativeGet(item: string, receptor: string){
      if(!this[receptor]){
        this.nativeStorage.getItem(item)
        .then(  
          data => {
            this[receptor] = data;
            console.error(item+' recuperé NS');
          },
          error => {
            console.error('Erreur recuperation NS '+item+': '+error);
            if (item == 'ns_expressoList'){
              // this.loadExpressoList(-3);
            }
            if (item == 'ns_categorieList'){
              // this.loadCategorieList();
            }
        }
        ); 
      }
    }
    
  afficherToast(msg: string, temps: number) 
  {
      const toast = this.toastCtrl.create({
        message: msg,
        duration: temps
      }); 
      toast.present();
  }

  } // END CLASS
  
