import Notification from '../Components/Notification.svelte';

export function CreateNotification(title, color){
    color = color || "orange";
    let notif = new Notification({target: document.querySelector('.notifications'), props: {title: title, color: color}});
    setTimeout(() => notif.$destroy(), 4000);
}