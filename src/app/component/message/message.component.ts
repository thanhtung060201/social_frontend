import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/service/auth.service';
import { MessageService } from 'src/app/service/message.service';
import { UserService } from 'src/app/service/user.service';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-message',
	templateUrl: './message.component.html',
	styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit, OnDestroy {
	newMessage$: Observable<string>;
	messages: any[] = [];
	listFriends: any[] = [];
  inputControl = new FormControl();
  currentFriendId: string;
  defaultProfilePhoto = environment.defaultProfilePhoto;
  currentFriend: any;

	constructor(
    private messageService: MessageService,
    private userService: UserService,
    private authService: AuthService
  ) { }

	ngOnInit(): void {
    this.currentFriendId = localStorage.getItem('messageId');
    this.getAllFriendByUserId();
	}

  getAllFriendByUserId() {
    this.userService.getAllFriendByUserId().subscribe((data: any) => {
      this.listFriends = [...data];
      this.currentFriend = data[0];
    })
  }

	sendMessage(message: string) {

	}

  openConversation(userId: string) {
    localStorage.setItem('messageId', userId);
    this.userService.getUserById(this.authService.getAuthUserId()).subscribe((data) => {
      this.currentFriend = { ...data };
    });
  }

	ngOnDestroy(): void {

	}
}
