// import { HttpClient } from "@angular/common/http";
// import { Injectable } from "@angular/core";
// import { Socket } from "ngx-socket-io";
// import { catchError, Observable, tap, throwError } from "rxjs";
// import { environment } from "src/environments/environment";
// import { ChatSocketService } from "./chat-socket.service";

// @Injectable({
//     providedIn: 'root'
// })
// export class MessageService {
//   private host = environment.apiUrl;

//   constructor(private socket: ChatSocketService, private http: HttpClient) {}

//   getFriends(): Observable<any[]> {
//     return this.http.get<any[]>(`${this.host}/user/friends/my`);
//   }

//   sendMessage(message: string, conversation: any): void {
//     const newMessage: any = {
//       message,
//       conversation,
//     };
//     this.socket.emit('sendMessage', newMessage);
//   }

//   getNewMessage(): Observable<any> {
//     return this.socket.fromEvent<any>('newMessage');
//   }

//   createConversation(friend: any): void {
//     this.socket.emit('createConversation', friend);
//   }

//   joinConversation(friendId: number): void {
//     this.socket.emit('joinConversation', friendId);
//   }

//   leaveConversation(): void {
//     this.socket.emit('leaveConversation');
//   }

//   getConversationMessages(): Observable<any[]> {
//     return this.socket.fromEvent<any[]>('messages');
//   }

//   getConversations(): Observable<any[]> {
//     return this.socket.fromEvent<any[]>('conversations');
//   }
// }
