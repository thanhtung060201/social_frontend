import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppConstants } from 'src/app/common/app-constants';
import { PostResponse } from 'src/app/model/post-response';
import { User } from 'src/app/model/user';
import { UserResponse } from 'src/app/model/user-response';
import { AuthService } from 'src/app/service/auth.service';
import { UserService } from 'src/app/service/user.service';
import { environment } from 'src/environments/environment';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { FollowingFollowerListDialogComponent } from '../following-follower-list-dialog/following-follower-list-dialog.component';
import { PhotoUploadDialogComponent } from '../photo-upload-dialog/photo-upload-dialog.component';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { ViewPhotoDialogComponent } from '../view-photo-dialog/view-photo-dialog.component';
import { PostService } from 'src/app/service/post.service';
import { TimelineService } from 'src/app/service/timeline.service';

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
	authUser: User;
	profileUserId: number;
	profileUser: any;
	profileUserPostResponses: any[] = [];
	isProfileViewerOwner: boolean = false;
	viewerFollowsProfileUser: boolean = false;
	resultPage: number = 1;
	resultSize: number = 5;
	hasMoreResult: boolean = true;
	fetchingResult: boolean = false;
	loadingProfile: boolean = false;
	hasNoPost: boolean = false;
	statusFriend: 'pending' | 'accepted' | 'declined' | 'not-sent' | 'waiting-for-current-user-response' = 'not-sent';
	currentRequestFriendId: string = '';
	listFriends: any[] = [];
	dataRequest: any;

	private subscriptions: Subscription[] = [];

	constructor(
		private userService: UserService,
		public authService: AuthService,
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private matDialog: MatDialog,
		private matSnackbar: MatSnackBar,
    private timelineService: TimelineService
  ) { }

	ngOnInit(): void {
		if (!this.authService.isUserLoggedIn()) {
			this.router.navigateByUrl('/login');
		} else {
			this.loadingProfile = true;
			this.authUser = this.authService.getAuthUserFromCache();

			if (this.activatedRoute.snapshot.paramMap.get('userId') === null) {
				this.isProfileViewerOwner = true;
				this.profileUserId = this.authService.getAuthUserId();
			} else {
				this.profileUserId = Number(this.activatedRoute.snapshot.paramMap.get('userId'));
			}

			this.subscriptions.push(
				this.userService.getUserById(this.profileUserId).subscribe({
					next: (foundUserResponse: UserResponse) => {
						const foundUser: any = foundUserResponse;

						if (foundUser.id === this.authUser.id) {
							this.router.navigateByUrl('/profile');
						}

						// this.viewerFollowsProfileUser = foundUserResponse.followedByAuthUser;

						if (!foundUser.imagePath) {
							foundUser.imagePath = environment.defaultProfilePhoto
						}

						if (!foundUser.coverPhoto) {
							foundUser.coverPhoto = environment.defaultCoverPhotoUrl
						}

						this.profileUser = foundUser;

						this.loadProfilePosts();

						this.loadingProfile = false;
					},
					error: (errorResponse: HttpErrorResponse) => {
						localStorage.setItem(AppConstants.messageTypeLabel, AppConstants.errorLabel);
						localStorage.setItem(AppConstants.messageHeaderLabel, AppConstants.notFoundErrorHeader);
						localStorage.setItem(AppConstants.messageDetailLabel, AppConstants.notFoundErrorDetail);
						localStorage.setItem(AppConstants.toLoginLabel, AppConstants.falseLabel);
						this.loadingProfile = false;
						this.router.navigateByUrl('/message');
					}
				})
			);
			this.getAllFriendByUserId();
			this.getStatusRequestFriend();

		}


	}

  moveMessagePage(id: number) {
    this.router.navigate(['/message']);
    localStorage.setItem('messageId', id.toString());
  }

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}

	stopPropagation(e: Event): void {
		e.stopPropagation();
	}

	loadProfilePosts(): void {
		if (!this.fetchingResult) {
			this.fetchingResult = true;
			this.subscriptions.push(
				this.timelineService.getPostByUserId(this.profileUserId).subscribe({
					next: (postResponses: PostResponse[]) => {
						this.profileUserPostResponses = [...postResponses];
						if (postResponses.length === 0)  this.hasNoPost = true;
						this.fetchingResult = false;
					},
					error: (errorResponse: HttpErrorResponse) => {
						this.matSnackbar.openFromComponent(SnackbarComponent, {
							data: AppConstants.snackbarErrorContent,
							panelClass: ['bg-danger'],
							duration: 5000
						});
					}
				})
			);
		}
	}

	getAllFriendByUserId() {
		this.userService.getAllFriendByUserId().subscribe((data: any) => {
			this.listFriends = [...data];
		})
	}

	getStatusRequestFriend() {
		this.userService.getStatusRequestFriend(this.profileUserId).subscribe((data: any) => {
			this.statusFriend = data.status as any;
			this.currentRequestFriendId = data.id;
      this.dataRequest = data;
		});
	}

	sendRequestFriend(userId: any) {
		this.userService.sendRequestFriend(userId).subscribe((data) => {
			this.statusFriend = 'pending';
		});
	}

	cancelRequestFriend(userId: any) {}

	acceptRequestFriend(requestFriendId: any) {
		this.userService.updateRequestFriend(requestFriendId, 'accepted').subscribe((data) => {
			this.statusFriend = 'accepted';
		})
	}

	// openFollowingDialog(user: User): void {
	// 	this.matDialog.open(FollowingFollowerListDialogComponent, {
	// 		data: {
	// 			user,
	// 			type: 'following'
	// 		},
	// 		autoFocus: false,
	// 		minWidth: '400px',
	// 		maxWidth: '500px'
	// 	});
	// }

	openMyFriendsDialog(): void {
		this.matDialog.open(FollowingFollowerListDialogComponent, {
			data: this.listFriends,
			autoFocus: false,
			minWidth: '400px',
			maxWidth: '500px'
		});
	}

	openViewPhotoDialog(photoUrl: string): void {
		this.matDialog.open(ViewPhotoDialogComponent, {
			data: photoUrl,
			autoFocus: false,
			maxWidth: '1200px'
		});
	}

	openFollowConfirmDialog(userId: number): void {
		const dialogRef = this.matDialog.open(ConfirmationDialogComponent, {
			data: `Do you want to follow ${this.profileUser.firstName + ' ' + this.profileUser.lastName}?`,
			autoFocus: false,
			maxWidth: '500px'
		});

		dialogRef.afterClosed().subscribe(
			(result) => {
				if (result) {
					this.subscriptions.push(
						this.userService.followUser(userId).subscribe({
							next: (response: any) => {
								this.viewerFollowsProfileUser = true;
								this.matSnackbar.openFromComponent(SnackbarComponent, {
									data: `You are following ${this.profileUser.firstName + ' ' + this.profileUser.lastName}.`,
									duration: 5000
								});
							},
							error: (errorResponse: HttpErrorResponse) => {
								this.matSnackbar.openFromComponent(SnackbarComponent, {
									data: AppConstants.snackbarErrorContent,
									panelClass: ['bg-danger'],
									duration: 5000
								});
							}
						})
					);
				}
			}
		);
	}

	openUnfollowConfirmDialog(userId: number): void {
		const dialogRef = this.matDialog.open(ConfirmationDialogComponent, {
			data: `Do you want to stop following ${this.profileUser.firstName + ' ' + this.profileUser.lastName}?`,
			autoFocus: false,
			maxWidth: '500px'
		});

		dialogRef.afterClosed().subscribe(
			(result) => {
				if (result) {
					this.subscriptions.push(
						this.userService.unfollowUser(userId).subscribe({
							next: (response: any) => {
								this.viewerFollowsProfileUser = false;
								this.matSnackbar.openFromComponent(SnackbarComponent, {
									data: `You no longer follow ${this.profileUser.firstName + ' ' + this.profileUser.lastName}.`,
									duration: 5000
								});
							},
							error: (errorResponse: HttpErrorResponse) => {
								this.matSnackbar.openFromComponent(SnackbarComponent, {
									data: AppConstants.snackbarErrorContent,
									panelClass: ['bg-danger'],
									duration: 5000
								});
							}
						})
					);
				}
			}
		);
	}

	openPhotoUploadDialog(e: Event, uploadType: string): void {
		e.stopPropagation();

		let header: string;
		if (uploadType === 'profilePhoto') {
			header = 'Upload Ảnh đại diện';
		}

		const dialogRef = this.matDialog.open(PhotoUploadDialogComponent, {
			data: { authUser: this.profileUser, uploadType, header },
			autoFocus: false,
			minWidth: '300px',
			maxWidth: '900px',
			maxHeight: '500px'
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
        this.profileUser.imagePath = result;
			}
		});
	}

	handlePostDeletedEvent(postResponse: PostResponse): void {
		document.getElementById(`profilePost${postResponse.post.id}`).remove();
	}
}
