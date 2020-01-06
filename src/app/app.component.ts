import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { OneSignal } from '@ionic-native/onesignal';

// provider
import { GlobalProvider } from "../providers/global/global";

import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;

  pages: Array<{title: string, component: any}>;

  constructor(
            public platform: Platform,
            public statusBar: StatusBar, 
            public splashScreen: SplashScreen,
            public oneSignal: OneSignal,
            public global: GlobalProvider
     ) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Home', component: HomePage },
      { title: 'List', component: ListPage }
    ];

  }


  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      
      // ONE SIGNAL PUSH NOTIFICATION SCRIPT
          this.oneSignal.startInit('011c3464-0379-4e01-a8ee-76e47523645e', '142941554346');
          this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);
          this.oneSignal.handleNotificationReceived().subscribe(() => {
          // do something when notification is received
          });
          this.oneSignal.handleNotificationOpened().subscribe(() => {
            // do something when a notification is opened
          });
          this.oneSignal.endInit();

          // this.global.loadOfflineVar();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
  
  // charger page HomePage avec variable Categorie
  selectCategorie(id: number){
    console.log('selected :'+id);
    this.nav.setRoot(HomePage,{'selectedCategorie':id});
  }
}
