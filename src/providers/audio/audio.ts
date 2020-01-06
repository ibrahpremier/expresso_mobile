import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Media, MediaObject } from '@ionic-native/media';

// provider
import { GlobalProvider } from "../../providers/global/global";

/*
  Generated class for the AudioProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AudioProvider {

  constructor(
              public http: HttpClient,
              public audio: Media,
              public global: GlobalProvider
              ) 
  {
    console.log('Hello AudioProvider Provider');
  }

  startAudio(index: number)
  {
    console.log('isReading Initial: '+this.global.isReading);
    if(this.global.isReading != -1){
      this.stopAudio();
    } 
    else{ 
        let fichier = this.global.urlLocal[index];
        this.global.song = this.audio.create(fichier);
        this.global.song.play();
        this.global.isReading = index;
        console.log('lecture audio '+ index +' demarrée');
      
        this.global.song.onStatusUpdate.subscribe((statusCode)=> {
          // status 4 correspond a fin de lecture
          if(statusCode == 4){ 
            console.log('lecture '+index+' terminée');
            this.global.isReading = -1;
            // this.compter_action('lecture',index);
            this.global.afficherToast('lecture terminée',500); // pour fixer bug sur reapparution auto de btn Play
          }
      });
    }
  }


  stopAudio()
  {
    // this.song.stop();
    this.global.song.release();
    console.log('audio '+this.global.isReading+' stoppé');
    this.global.isReading = -1;
  }

}// END CLASS
