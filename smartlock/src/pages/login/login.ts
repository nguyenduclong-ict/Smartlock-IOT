import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Socket } from 'ng-socket-io';
import { AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

import { SignupPage } from '../signup/signup';
import { RepassPage } from '../repass/repass';
import { TabsPage } from '../tabs/tabs';
import { Storage } from '@ionic/storage';
/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  username = '';
  password = '';
  loader;
  token = '';

  constructor(public navCtrl: NavController, private socket: Socket,
    private alertCtrl: AlertController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    private storage: Storage) {


    // Code
    this.socket.connect();

    this.storage.get('token').then((data) => {
      if(!data) return;
      this.loginWithToken(data);
    });

    this.socket.on('res:login', (data) => {
      this.disableLoading();
      if (data.result == true) {
        this.storage.set('token', data.token);

        let currentIndex = this.navCtrl.getActive().index;
        this.navCtrl.push(TabsPage, { token : data.token}).then(()=>{
          navCtrl.remove(currentIndex);
        });
      }
    });

    this.socket.on('res:login-token', (data) => {
      this.disableLoading();
      if (data.result == true) {
        this.storage.set('token', data.token);
        this.navCtrl.push(TabsPage, { token : data.token});
      } else {
        this.createAlert('Lỗi', data.comment);
      }
    });

    socket.on('error', (data) => {
      this.createAlert('Lỗi', data);
    });

    socket.on('Err', (data) => {
      this.disableLoading();
      this.createAlert('Lỗi', data.comment);
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  loginWithToken (token) {
      this.socket.emit('req:login-token', { token : token });
      this.presentLoading("Đang đăng nhập");
  }

  login() {
    this.socket.emit('req:login', { username: this.username, password: this.password });
    this.presentLoading("Đang đăng nhập");
  }

  signup() {
    this.navCtrl.push(SignupPage);
  }

  recoveryPass() {
    this.navCtrl.push(RepassPage);
  }

  createAlert(title, message) {
    if (title == null) title = 'notify';
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
  }

  

  presentLoading(message) {
    this.loader = this.loadingCtrl.create({
      content: message,
      duration: 30000
    });
    this.loader.present();
  }

  disableLoading() {
    this.loader.dismiss();
  }
}
