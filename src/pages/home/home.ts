import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, Platform } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { File, FileEntry } from '@ionic-native/file';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Media, MediaObject } from '@ionic-native/media';
import { NativeStorage } from '@ionic-native/native-storage';
import { StatusBar } from '@ionic-native/status-bar';

// import { LocalNotifications } from '@ionic-native/local-notifications';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  [x: string]: any;

  // PERSONNEL
  categorieList: any;
  expressoList: any;
  expressoListCache: any;
  isReading: number = -1;
  isFirstLoading: number;
  loadingPlay: number;
  loadingShare: number;
  selectedCategorieName: string = 'Tout';
  public song: MediaObject;
  public urlLocal: Array<any> = [];
  public cptShare:  Array<any> = [];
  public cptRead:  Array<any> = [];

  constructor(
      public navCtrl: NavController,
      private navParams: NavParams,
      public http: HttpClient,
      public toastCtrl: ToastController,
      public file: File, 
      public txfr: FileTransfer, 
      public audio: Media,
      public platform: Platform,
      private socialSharing: SocialSharing,
      private nativeStorage: NativeStorage,
      private statusBar: StatusBar
    ) {
      platform.ready().then(() => {
        statusBar.styleDefault();
        if (platform.is('android')) {
            statusBar.overlaysWebView(false);
            statusBar.backgroundColorByHexString('#000000');
        }
        this.slideMenuAction();
        this.loadOfflineVar();
      });
  }

  loadOfflineVar(){
      this.nativeGet('ns_urlLocal','urlLocal');
      this.nativeGet('ns_expressoList','expressoList');
      this.nativeGet('ns_expressoList','expressoListCache');
      this.nativeGet('ns_categorieList', 'categorieList');
  }
  
  // AVANT LE CHARGEMENT DE LA PAGE
  ionViewWillEnter() : void {}

  // Naviguer entre les pages
  // naviguer(page: any,param: any){this.navCtrl.push(page, param);}  

  changeCategorie(val:string){
    this.selectedCategorieName = val[0].toUpperCase() + val.substr(1).toLowerCase();
    // console.log(this.selectedCategorieName);
    this.expressoList = this.expressoListCache;
      // Reset items back to all of the items
    if(val!='tout'){
      this.expressoList = this.expressoList.filter((item) => {
        return item.titre_categorie.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    }
  }
  
    // SCRIPT DE RECHERCHE A PARTIR DU CHAMP INPUT
    rechercher(ev)
    {
    // Reset items back to all of the items
      this.expressoList = this.expressoListCache;
      var val = ev.target.value;
      if (val && val.trim() != '') 
      {
        this.expressoList = this.expressoList.filter((item) => {
          return item.description_expresso.toLowerCase().indexOf(val.toLowerCase()) > -1;
        })
      } 
    }
  
// CHARGER LA LISTE DES CATEGORIES
  loadCategorieList() : void
  {
     let headers 	: any		= new HttpHeaders({ 'Content-Type': 'application/json' }),
         options 	: any		= { "requete": "categorie", "idCategorie" : -1},
         url      : any   = "http://digital-co.ci/expresso/php-script/recuperer.php";

     this.http.post(url, JSON.stringify(options), headers)
     .subscribe((data : any) =>
     {
        this.categorieList = data;        
        console.log('categorie chargées');
        this.nativeSave('ns_categorieList', this.categorieList);
     },
     (error : any) =>
     {
      console.log('erreur pour recuperer les categorie');
     }); 
  }

  // RECHARGER LA PAGE LORSQUE PAS D INTERNET, LORS DU 1ER LANCEMENT
  recharger(){
    this.isFirstLoading = 1;
    this.loadExpressoList(-3);
    this.loadCategorieList();
  }

// CHARGER LA LISTE DES EXPRESSO
  loadExpressoList(id: number) : void
  {
      let headers 	: any		= new HttpHeaders({ 'Content-Type': 'application/json' }),
          options 	: any		= { "requete": "expresso", "idCategorie" : id },
          url      : any   = "http://digital-co.ci/expresso/php-script/recuperer.php";

      this.http.post(url, JSON.stringify(options), headers)
      .subscribe((data : any) =>
      {
        this.expressoList = data;
        this.expressoListCache = data;
        this.isFirstLoading = 0;
        console.log('expresso chargé');
        this.afficherToast(`Contenu actualisé`,1500);
        if(this.cptRead==null) {this.initVarCpt('read');}// initialiser les compteurs hors ligne
        if(this.cptShare==null) {this.initVarCpt('share');}// initialiser les compteurs hors ligne
        this.nativeSave('ns_expressoList',this.expressoList);
        // this.nativeSave('ns_expressoListCache',this.expressoListCache);
      },
       (error : any) =>
      {
        this.isFirstLoading = 0;
        this.afficherToast(`Erreur connexion internet`,3000);
        console.log('liste Non synchronisé:');
      // console.log(JSON.stringify(error));
      });
  }

  
  telecharger(url: string, index: number, action: string)
  { 
    if(this.urlLocal[index] != null){
      console.log('son '+index+ ' deja télechargé');
           if(action == 'play'){
              this.startAudio(index);
            }
           else if(action == 'share'){
              this.partager(index);
           }
    } 
    else {
      if(action == 'play'){this.loadingPlay = index;}
      else{this.loadingShare = index;}
      
       let ft: FileTransferObject = this.txfr.create();
       let fn = this.file.dataDirectory + url.substring(url.lastIndexOf('/') + 1);
       ft.download( url, fn ).then(
         (fe: FileEntry) => {
           this.urlLocal[index] = fe.nativeURL;
           console.log('son '+index+ ' télechargé a l\'instant');
           console.log('enregistré sous: '+fe.nativeURL);
           this.nativeSave('ns_urlLocal',this.urlLocal);
           this.loadingPlay = -1;
           this.loadingShare = -1;
           if(action == 'play'){
              this.startAudio(index);
            }
           else if(action == 'share'){
              this.partager(index);
           }
         },
         err => {
           console.log('télechargement ERROR');
          //  console.log(JSON.stringify(err));
           this.loadingPlay = -1;
           this.loadingShare = -1;
           this.afficherToast("Erreur chargement, Verifiez votre connexion internet",2000);
         }
       );
    }
  }
  
  public partager(index: number) 
  {
    let fichier = this.urlLocal[index];
        this.socialSharing.share(null,null,fichier,null)
        .then(()=> {
          console.log('succes partage');
          this.compter_action('partage',index);
        })
        .catch(()=> {
          console.log('erreur partage');
        });
  }

  startAudio(index: number)
  {
    console.log('isReading Initial: '+this.isReading);
    if(this.isReading != -1){
      this.stopAudio();
    } 
    else{ 
        let fichier = this.urlLocal[index];
        this.song = this.audio.create(fichier);
        this.song.play();
        this.isReading = index;
        console.log('lecture audio '+ index +' demarrée');
      
        this.song.onStatusUpdate.subscribe((statusCode)=> {
          // status 4 correspond a fin de lecture
          if(statusCode == 4){ 
            console.log('lecture '+index+' terminée');
            this.isReading = -1;
            this.compter_action('lecture',index);
            this.afficherToast('lecture terminée',500); // pour fixer bug sur reapparution auto de btn Play
          }
      });
    }
  }


  stopAudio()
  {
    // this.song.stop();
    this.song.release();
    console.log('audio '+this.isReading+' stoppé');
    this.isReading = -1;
  }

  compter_action(action: string, id: number) : void
  {
      let headers 	: any		= new HttpHeaders({ 'Content-Type': 'application/json' }),
          options 	: any		= { "requete": action, "id_expresso" : id },
          url      : any   = "http://digital-co.ci/expresso/php-script/compter.php";

      this.http.post(url, JSON.stringify(options), headers)
      .subscribe((data : any) =>
      {
        console.log('compteur ok');
        if(action == 'partage'){
          this.changeCategorie(this.selectedCategorieName);
        }
      },
       (error : any) =>
      {
        console.log('compteur erreur');// GESTION HORS LIGNE
        if(action == 'lecture'){
          this.cptRead[id] = this.cptRead[id]+1; 
          console.log('song '+id+' lu: '+this.cptRead[id]+' fois hors ligne');
          // this.nativeSave('ns_cptRead',this.cptRead);
        } else 
          if(action == 'partage'){
          this.cptShare[id] = this.cptShare[id]+1; 
          console.log('song '+id+' partagé: '+this.cptShare[id]+' fois hors ligne');
          this.nativeSave('ns_cptShare',this.cptShare);
        }
      });
  }
  // verifier si le l'indice du tableau cptShare, ou cptread est sup a 0; si oui appeler la fonction maj_compter_action(indice,valeur). cette fonction fait une req update pour ajouter valeur dans le champs dont l'indice est indice dans la bd 
  maj_compter_action(){
  }
  
  nativeSave(item: string, value: any){
      this.nativeStorage.setItem(item, value)
    .then(
      () => { console.log(item+' sauvegardé!');},
      error => console.error(' ERROR Native storage: '+item, error)
    );
  }

  nativeGet(item: string, receptor: string){
      this.nativeStorage.getItem(item)
      .then(  
        data => {
          this[receptor] = data;
          console.warn(item+' recuperé NS');
        },
        error => {
          console.warn('Erreur recuperation NS '+item+': '+error);
          if (item == 'ns_expressoList'){
            this.isFirstLoading = 0;
            this.loadExpressoList(-3);
          }
          if (item == 'ns_categorieList'){
            this.isFirstLoading = 0;
            this.loadCategorieList();
          }
      }
      ); 
  }

  afficherToast(msg: string, temps: number) 
  {
      const toast = this.toastCtrl.create({
        message: msg,
        duration: temps
      }); 
      toast.present();
  }

  slideMenuAction()
  {
    if(this.navParams.get('selectedCategorie') ){
      if ((this.navParams.get('selectedCategorie')==-2) || (this.navParams.get('selectedCategorie')==-3)){
        this.loadExpressoList(this.navParams.get('selectedCategorie'));
      }
      else{
        this.changeCategorie('tout');
      }
    }
   }

  //  INITIALISER LES COMPTEURS HORS LIGNE (a revoir)
  initVarCpt(target: string){
    switch(target){
      case 'read' :
          for(var i = 1; i <= this.expressoList.length; i++) { 
            this.cptRead[i] = 0;
          }
      break;
      case 'share' :
          for(var a = 1; a <= this.expressoList.length; a++) { 
            this.cptShare[a] = 0;
          }
      break;
    }
  }
  
        // console.warn('dataGet '+item+': '+JSON.stringify(this[receptor]));
}
