import { Injectable } from "@angular/core";
import { Socket } from "ngx-socket-io";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class MessageService {
    constructor(private socket: Socket) {}

    sendMessage(message: string): void {
        this.socket.emit('sendMessage', message);
    }

    getNewMessage(): Observable<any> {
        return this.socket.fromEvent<string>('newMessage');
    }
}