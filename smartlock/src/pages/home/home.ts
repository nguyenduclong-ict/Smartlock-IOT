import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular'; 
import { Socket } from 'ng-socket-io';

import { LoginPage } from '../login/login';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  token;
  listDevices = [];
  divItem;
  constructor(public navCtrl: NavController, private navParams: NavParams,
    private socket: Socket, private alertCtrl: AlertController) {

    this.token = navParams.get('token');

    socket.emit('req:devices-status', { token: this.token });
    socket.emit('req:list-devices');
    socket.emit('req:devices-status');
    socket.on('device:update-status', (data) => {
      let index = this.listDevices.map(a => a.mac).indexOf(data.mac);
      if (index > -1) {
        // this.listDevices[index].name = 'data.name';
        if (data.status === 'no-lock') {
          this.listDevices[index].status = 'Mở';
        } else {
          this.listDevices[index].status = 'Đóng';
        }
        this.listDevices[index].online = true;
        this.listDevices[index].allowOpen = data.allowOpen;
      } else {
        
      }
    });

    socket.on('res:list-devices', (data) => {
      data.forEach(element => {
        this.listDevices.push({
          mac: element[0],
          name: element[1],
          status: '--',
          online: false,
          allowOpen: false
        });
      });
    });

    socket.on('arduino-offline', (data) => {
      let index = this.listDevices.map(a => a.mac).indexOf(data.mac);
      if(index > -1) {
        this.listDevices[index].online = false;
      } 
    })

    // socket.on('error', (data) => {
    //   this.createAlert('Lỗi', data);
    // });

    // socket.on('Err', (data) => {
    //   this.createAlert('Lỗi', data.toString());
    // });

    socket.on('res:add-device', (data) => {
      if(data.result == true) {
        this.createAlert('Done!', 'Thêm thiết bị thành công');
        this.listDevices = [];
        let currentIndex = this.navCtrl.getActive().index;
        this.navCtrl.push(LoginPage, { token : data.token}).then(()=>{
          navCtrl.remove(currentIndex);
        });
      }
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

  createAlertInput(title, message) {
    if (title == null) title = 'notify';
    let alert = this.alertCtrl.create({
      title: title,
      inputs: [
        {
          name: "mac",
          placeholder: "Địa chỉ mac"
        },
        {
          name: "name",
          placeholder: "Tên thiết bị"
        }],
        buttons: [
          {
            text: 'Thêm',
            role: 'add',
            handler: data => {
              if(data.mac.length == 0) {
                this.createAlert('Error', 'Địa chỉ mac không hợp lệ');
                return;
              }
              let info = {
                mac : data.mac,
                name: data.name,
                token: this.token
              }
              
              this.socket.emit('req:add-device', info);
            }
          }, 
          {
            text: 'Hủy',
            role: 'cancel',
            handler: data => {
              
            }
          }
        ]
      
    });
    alert.present();
  }

  changeAllow(mac, status) {
    this.socket.emit('allow-Open', {mac: mac, status: status});
  }
}
