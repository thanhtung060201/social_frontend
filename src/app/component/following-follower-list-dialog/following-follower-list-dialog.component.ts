import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from 'src/app/service/user.service';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-following-follower-list-dialog',
	templateUrl: './following-follower-list-dialog.component.html',
	styleUrls: ['./following-follower-list-dialog.component.css']
})
export class FollowingFollowerListDialogComponent implements OnInit {
	myFriendResponseList: any[] = [];
	defaultProfilePhoto = environment.defaultProfilePhoto;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		private userService: UserService,
	) { }

	ngOnInit(): void {
		this.myFriendResponseList = this.data;
		console.log(this.myFriendResponseList);
	}

	ngOnDestroy(): void {

	}
}
