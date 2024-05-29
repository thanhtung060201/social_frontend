import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { noop, Subscription } from 'rxjs';
import { AppConstants } from 'src/app/common/app-constants';
import { PostResponse } from 'src/app/model/post-response';
import { Tag } from 'src/app/model/tag';
import { AuthService } from 'src/app/service/auth.service';
import { PostService } from 'src/app/service/post.service';
import { TimelineService } from 'src/app/service/timeline.service';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { UserService } from 'src/app/service/user.service';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { SuggestFriendDialogComponent } from '../suggest-friend-dialog/suggest-friend-dialog.component';

@Component({
	selector: 'app-timeline',
	templateUrl: './timeline.component.html',
	styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit, OnDestroy {
	timelinePostResponseList: any[] = [];
	timelineTagList: Tag[] = [];
	noPost: boolean = false;
	hasMoreResult: boolean = true;
	fetchingResult: boolean = false;
	isTaggedPostPage: boolean = false;
	targetTagName: string;
	loadingTimelinePostsInitially: boolean = true;
	loadingTimelineTagsInitially: boolean = true;
	requestFriends: any[] = [];
	listFriends: any[] = [];
	listFriendsBodToday: any[] = [];

	private subscriptions: Subscription[] = [];
	defaultProfilePhoto = environment.defaultProfilePhoto;


	constructor(
		private authService: AuthService,
		private userService: UserService,
		private timelineService: TimelineService,
		private postService: PostService,
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private matSnackbar: MatSnackBar,
		private cd: ChangeDetectorRef,
		private matDialog: MatDialog,
	) { }

	ngOnInit(): void {
		if (!this.authService.isUserLoggedIn()) {
			this.router.navigateByUrl('/login');
		} else {
			if (this.router.url !== '/') {
				this.targetTagName = this.activatedRoute.snapshot.paramMap.get('tagName');
				this.isTaggedPostPage = true;
				this.loadTaggedPosts(this.targetTagName, 1);
			} else {
				this.loadTimelinePosts();
			}

			this.loadTimelineTags();
			this.loadAllRequestFriend();
			this.loadAllFriendByUserId();
		}
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}

	loadTimelinePosts(): void {
		this.timelineService.getTimelinePosts().subscribe({
			next: (postResponseList: any[]) => {
				if (!postResponseList.length) this.noPost = true;

				// postResponseList.forEach(pR => this.timelinePostResponseList.push(pR));
				this.timelinePostResponseList = [...postResponseList.sort((a, b) => (a.id > b.id ? -1 : 1))];

				this.timelinePostResponseList = this.timelinePostResponseList.filter((data) => data.userIds.includes(data.author.id));

				console.log('-------------', this.timelinePostResponseList);

				// if (postResponseList.length > 0) {
				// 	this.hasMoreResult = true;
				// } else {
				// 	this.hasMoreResult = false;
				// }

				// this.fetchingResult = false;
				this.loadingTimelinePostsInitially = false;
				this.cd.detectChanges();
			},
			error: (errorResponse: HttpErrorResponse) => {
				this.matSnackbar.openFromComponent(SnackbarComponent, {
					data: AppConstants.snackbarErrorContent,
					panelClass: ['bg-danger'],
					duration: 5000
				});
				this.fetchingResult = false;
			}
		})
	}

	loadTaggedPosts(tagName: string, currentPage: number): void {
		if (!this.fetchingResult) {
			this.fetchingResult = true;
			this.subscriptions.push(
				this.postService.getPostsByTag(tagName).subscribe({
					next: (postResponseList: PostResponse[]) => {
						if (!postResponseList.length) this.noPost = true;

						postResponseList.forEach(pR => this.timelinePostResponseList.push(pR));
						// if (postResponseList.length > 0) {
						// 	this.hasMoreResult = true;
						// } else {
						// 	this.hasMoreResult = false;
						// }
						// this.fetchingResult = false;
					},
					error: (errorResponse: HttpErrorResponse) => {
						this.matSnackbar.openFromComponent(SnackbarComponent, {
							data: AppConstants.snackbarErrorContent,
							panelClass: ['bg-danger'],
							duration: 5000
						});
						this.fetchingResult = false;
					}
				})
			);
		}
	}

	loadTimelineTags(): void {
		this.loadingTimelineTagsInitially = false;
		this.fetchingResult = true;
		this.subscriptions.push(
			this.timelineService.getTimelineTags().subscribe({
				next: (tagList: Tag[]) => {
					this.timelineTagList = [...tagList];
					this.loadingTimelineTagsInitially = false;
					this.fetchingResult = false;
				},
				error: (errorResponse: HttpErrorResponse) => {
					this.matSnackbar.openFromComponent(SnackbarComponent, {
						data: AppConstants.snackbarErrorContent,
						panelClass: ['bg-danger'],
						duration: 5000
					});
					this.fetchingResult = false;
				}
			})
		);
	}

	loadAllRequestFriend() {
		this.userService.getAllRequestFriend().subscribe({
			next: (requestFriends: any[]) => {
				this.fetchingResult = false;

				this.requestFriends = [...requestFriends.map((requestFriend) => requestFriend.creator)];
				console.log(this.requestFriends);
			},
			error: (errorResponse: HttpErrorResponse) => {
				this.matSnackbar.openFromComponent(SnackbarComponent, {
					data: AppConstants.snackbarErrorContent,
					panelClass: ['bg-danger'],
					duration: 5000
				});
				this.fetchingResult = false;
			}
		})
	}

	loadAllFriendByUserId() {
		this.userService.getAllFriendByUserId().subscribe((data: any) => {
			this.listFriends = [...data];
			this.listFriendsBodToday = [...data.filter((friend) => friend.id != this.authService.getAuthUserId() && friend.dob && new Date(friend.dob).getDay() == new Date(Date.now()).getDay() && new Date(friend.dob).getMonth() == new Date(Date.now()).getMonth())];
		})
	}

	acceptRequestFriend(requestFriendId: any) {
		this.userService.updateRequestFriend(requestFriendId, 'accepted').subscribe((data) => {})
	}

	openDialogSuggestFriend() {
		this.matDialog.open(SuggestFriendDialogComponent, {
			data: null,
			autoFocus: false,
			minWidth: '500px',
			maxWidth: '700px'
		});
	}
}
