import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Alert } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Socket } from 'ng-socket-io';
/**
 * Generated class for the SignupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {
  username = '';
  password = '';
  repassword = '';
  name = '';
  email = '';

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private socket: Socket) {

    this.socket.on('res:sign-up', (result) => {
      if (result) {
        this.createAlert('Thành công', 'Đăng kí tài khoản thành công');
        return;
      }
    })
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad SignupPage');
  }


  signUp() {
    this.username = this.username.trim();
    this.password = this.password.trim();
    this.name = this.name.trim();
    this.email = this.email.trim();

    if (this.username.length < 4 || this.username.includes(' ')) {
      this.createAlert(null, 'Tên tài khoản không hợp lệ');
      return;
    }

    if (this.password.length < 4 || this.password.includes(' ')) {
      this.createAlert(null, 'Mật khẩu không hợp lệ');
      return;
    }

    if (this.password != this.repassword) {
      this.createAlert('Lỗi', 'Mật khẩu không trùng khớp');
    }

    if (this.email.length < 4 || this.email.includes(' ') || this.email.indexOf('@') < 1 || this.email.indexOf('@') > this.email.length - 1) {
      this.createAlert(null, 'Email không hợp lệ');
      return;
    }

    this.socket.emit('req:sign-up', {
      username: this.username,
      password: this.password,
      name: this.name,
      email: this.email
    });


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

  backClose() {
    let currentIndex = this.navCtrl.getActive().index;
    this.navCtrl.remove(currentIndex);
    
  }
}
