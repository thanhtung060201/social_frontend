import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AuthService } from 'src/app/service/auth.service';
import { UserService } from 'src/app/service/user.service';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-suggest-friend-dialog',
	templateUrl: './suggest-friend-dialog.component.html',
	styleUrls: ['./suggest-friend-dialog.component.css']
})
export class SuggestFriendDialogComponent implements OnInit, OnDestroy {
	keyword = new FormControl(null);
	users: any[] = [];
	listFriendIds: any[] = [];
	defaultProfilePhoto = environment.defaultProfilePhoto;

	constructor(private userService: UserService, private authService: AuthService) {}

	ngOnInit(): void {
		this.getAllFriendByUserId();
		setTimeout(() => {
			this.searchUser();
		}, 100);
	}

	searchUser() {
		this.userService.getUserSearchResult(this.keyword.value ? this.keyword.value : 'null').subscribe((dataUsers: any) => {
			this.users = [...dataUsers.map(user => ({
				...user,
				isRequestFriend: false
			}))];

			this.users = this.users.filter((user) => !this.listFriendIds.includes(user.id) && user.id !== this.authService.getAuthUserId())
		})
	}

	getAllFriendByUserId() {
		this.userService.getAllFriendByUserId().subscribe((data: any) => {
			this.listFriendIds = [...data.map((user) => user.id)];
		})
	}

	sendRequestFriend(userId: string) {
		this.users = [...this.users.map((user) => ({
			...user,
			isRequestFriend: userId === user.id ? true : false
		}))]
	}

	ngOnDestroy(): void {
		
	}
}
