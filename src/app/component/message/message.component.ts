import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from 'src/app/service/auth.service';
import { MessageService } from 'src/app/service/message.service';
import { UserService } from 'src/app/service/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit, OnDestroy, AfterViewInit {
  newMessage$: Observable<string>;
  messages: any[] = [];
  listFriends: any[] = [];
  inputControl = new FormControl();
  defaultProfilePhoto = environment.defaultProfilePhoto;
  currentFriend: any;
  currentUser: any;
  conversations: any[] = [];
  conversation: any;

  currentFriend$: BehaviorSubject<any> = new BehaviorSubject<any>({});
  selectedConversationIndex: number = 0;
  currentUserId: any;
  @ViewChild('areaChat') private areaChat: ElementRef;

  constructor(
    private messageService: MessageService,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.currentUserId = this.authService.getAuthUserId();
  }

  ngOnInit(): void {
    this.messageService
      .getConversations()
      .subscribe((conversations: any[]) => {
        this.conversations.push(conversations[0]); // Note: from mergeMap stream
      });

    this.messageService
      .getConversationMessages()
      .subscribe((messages: any[]) => {
        messages.forEach((message: any) => {
          const allMessageIds = this.messages.map(
            (message: any) => message.id
          );
          if (!allMessageIds.includes(message.id)) {
            console.log('messages', this.messages);
            this.messages.push(message);
          }
        });
      });

    this.messageService
      .getNewMessage()
      .subscribe((message: any) => {
        message.createdAt = new Date();

        const allMessageIds = this.messages.map(
          (message: any) => message.id
        );
        if (!allMessageIds.includes(message.id)) {
          this.messages.push(message);
          console.log('messages', this.messages);
          setTimeout(() => {
            this.scrollToBottom();
          }, 200);
        }
      });

    this.currentFriend$.subscribe((friend: any) => {
      if (JSON.stringify(friend) !== '{}') {
        this.messageService.joinConversation(this.currentFriend.id);
      }
    });

    this.messageService
      .getFriends()
      .subscribe((friends: any[]) => {
        this.listFriends = friends;

        if (friends.length > 0) {
          this.currentFriend = this.listFriends[0];
          console.log(this.currentFriend);
          this.currentFriend$.next(this.currentFriend);

          friends.forEach((friend: any) => {
            this.messageService.createConversation(friend);
          });
          this.messageService.joinConversation(this.currentFriend.id);
        }
      });

    this.getCurrentUser();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.scrollToBottom();
    }, 1000);
  }

  getCurrentUser() {
    this.userService.getUserById(this.authService.getAuthUserId()).subscribe((currentUser) => {
      this.currentUser = { ...currentUser };
    })
  }


  sendMessage() {
    const message = this.inputControl.value;
    if (!message) return;

    let conversationUserIds = [this.authService.getAuthUserId(), this.currentFriend.id].sort();

    this.conversations.forEach((conversation: any) => {
      let userIds = conversation.users.map((user: any) => user.id).sort();

      if (JSON.stringify(conversationUserIds) === JSON.stringify(userIds)) {
        this.conversation = conversation;
      }
    });
    this.messageService.sendMessage(message, this.conversation);
    this.inputControl.reset();
  }

  openConversation(userId: string, index: number) {
    this.selectedConversationIndex = index;
    this.userService.getUserById(+userId).subscribe((data) => {
      this.currentFriend = { ...data };
      this.messageService.leaveConversation();
      this.currentFriend$.next(this.currentFriend);
    });
    this.getCurrentUser();
  }

  scrollToBottom() {
    this.areaChat.nativeElement.scrollTop = this.areaChat.nativeElement.scrollHeight;
  }

  ngOnDestroy(): void {

  }
}
