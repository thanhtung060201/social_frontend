import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppConstants } from 'src/app/common/app-constants';
import { Notification } from 'src/app/model/notification';
import { User } from 'src/app/model/user';
import { AuthService } from 'src/app/service/auth.service';
import { NotificationService } from 'src/app/service/notification.service';
import { environment } from 'src/environments/environment';
import { PostDialogComponent } from '../post-dialog/post-dialog.component';
import { SearchDialogComponent } from '../search-dialog/search-dialog.component';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { UserService } from 'src/app/service/user.service';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
	authUser: any;
	isUserLoggedIn: boolean = false;
	isProfilePage: boolean = false;
	notifications: any[] = [];
	hasUnseenNotification: boolean = false;
	resultPage: number = 1;
	resultSize: number = 5;
	hasMoreNotifications: boolean = false;
	fetchingResult: boolean = false;
	defaultProfilePhotoUrl = environment.defaultProfilePhotoUrl;
	defaultProfilePhoto = environment.defaultProfilePhoto;

	private subscriptions: Subscription[] = [];

	constructor(
		private authService: AuthService,
		private notificationService: NotificationService,
		private matDialog: MatDialog,
		private matSnackbar: MatSnackBar,
		private userService: UserService
	) { }

	ngOnInit(): void {
    if(localStorage.getItem('authToken') !== null) {
      this.isUserLoggedIn = true;
      console.log(JSON.parse(localStorage.getItem('authUser')));
      this.userService.getUserById(JSON.parse(localStorage.getItem('authUser')).id).subscribe((data) => {
        this.authUser = { ...data };
      });
    }

    this.authService.loginSubject.subscribe((isLogin) => {
      if(isLogin) {
        this.userService.getUserById(this.authService.getAuthUserId()).subscribe((data) => {
          this.authUser = { ...data };
          this.isUserLoggedIn = true;
        });
      }
    });

		this.loadNotifications();

		this.authService.logoutSubject.subscribe(loggedOut => {
			if (loggedOut) {
				this.isUserLoggedIn = false;
			}
		});
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}

	openPostDialog(): void {
		this.matDialog.open(PostDialogComponent, {
			data: null,
			autoFocus: false,
			minWidth: '500px',
			maxWidth: '700px'
		});
	}

	openSearchDialog(): void {
		this.matDialog.open(SearchDialogComponent, {
			autoFocus: true,
			width: '500px'
		});
	}

	loadNotifications(): void {
		this.fetchingResult = true;

		this.notificationService.getAllNotification().subscribe((data) => {
			this.notifications = [...data];
		})
	}

	acceptRequestFriend(requestFriendId: any) {
		this.userService.updateRequestFriend(requestFriendId, 'accepted').subscribe((data) => {})
	}

	handleUnseenNotifications(): void {
		// if (this.hasUnseenNotification) {
		// 	this.subscriptions.push(
		// 		this.notificationService.markAllSeen().subscribe({
		// 			next: (response: any) => {
		// 				this.hasUnseenNotification = false;
		// 			},
		// 			error: (errorResponse: HttpErrorResponse) => {
		// 				this.matSnackbar.openFromComponent(SnackbarComponent, {
		// 					data: AppConstants.snackbarErrorContent,
		// 					panelClass: ['bg-danger'],
		// 					duration: 5000
		// 				});
		// 			}
		// 		})
		// 	);
		// }
	}
}
