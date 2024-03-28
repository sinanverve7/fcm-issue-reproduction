import {FirebaseMessaging,} from '@capacitor-firebase/messaging';
import { App } from "@capacitor/app";
const LOGTAG = '[FirebaseMessagingPage]';

  initFcm()

  async function initFcm() {
    await FirebaseMessaging.addListener('tokenReceived', (event) => {
        console.log(`${LOGTAG} tokenReceived`, { event });
        if (event.token) {
          localStorage.setItem(
            "USER_TOKEN",
            this.CommonComponent.encryption(event.token)
          );
        }
    
      });
      await FirebaseMessaging.addListener('notificationReceived', async (event) => {
            const  { isActive } = await App.getState();
            if (isActive === false) {
                setTimeout(()=>{
                    console.log(`${LOGTAG} notificationReceived`, { event });
                },7777)
                const storedNotifs = JSON.parse(localStorage.getItem('storedNotifs')||JSON.stringify([]));
                storedNotifs.push(event)
                localStorage.setItem('storedNotifs', JSON.stringify(storedNotifs));
                return true;
            }

            if (isActive) {
            setTimeout(()=>{
                console.log('scheduling local notification');
            },7777)
            const notification = event.notification;
            const storedLocalNotifs = JSON.parse(localStorage.getItem('storedLocalNotifs')||JSON.stringify([]));
            storedLocalNotifs.push(event)
            localStorage.setItem('storedLocalNotifs', JSON.stringify(storedLocalNotifs));
            
            localStorage.setItem('appstate',isActive?'foreground':'background')
            await LocalNotifications.schedule({
                notifications: [
                {
                    title: notification.title,
                    body: notification.body,
                    id: 1,
                    schedule: { at: new Date(Date.now() + 1000 * 2) },
                    
                    attachments: null,
                    actionTypeId: "",
                    extra: notification,
                },
                ],
            });
            }
      });
      await FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
        setTimeout(()=>{
          console.log(`${LOGTAG} notificationActionPerformed`, { event });
        },7777)
        
      });
      let permissionStatus = await FirebaseMessaging.requestPermissions();
      if (permissionStatus.receive === "granted") {
        const result = await FirebaseMessaging.getToken();
        console.log("FIREBASE ACCESS TOKEN - " + result.token);
        if (result.token) {
          localStorage.setItem(
            "USER_TOKEN",
            this.CommonComponent.encryption(result.token)
          );
        }
      }
  }

