import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, Output, OnDestroy, OnInit, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { AppConstants } from 'src/app/common/app-constants';
import { PostResponse } from 'src/app/model/post-response';
import { AuthService } from 'src/app/service/auth.service';
import { PostService } from 'src/app/service/post.service';
import { environment } from 'src/environments/environment';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { PostCommentDialogComponent } from '../post-comment-dialog/post-comment-dialog.component';
import { PostDialogComponent } from '../post-dialog/post-dialog.component';
import { PostLikeDialogComponent } from '../post-like-dialog/post-like-dialog.component';
import { PostShareDialogComponent } from '../post-share-dialog/post-share-dialog.component';
import { ShareConfirmDialogComponent } from '../share-confirm-dialog/share-confirm-dialog.component';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { WaitingDialogComponent } from '../waiting-dialog/waiting-dialog.component';
import { NotificationService } from 'src/app/service/notification.service';

@Component({
	selector: 'app-post',
	templateUrl: './post.component.html',
	styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit, OnDestroy {
	@Input() postResponse: any;
	@Output() postDeletedEvent = new EventEmitter<any>();
	authUserId: number;
	defaultProfilePhotoUrl = environment.defaultProfilePhotoUrl;
	defaultProfilePhoto = environment.defaultProfilePhoto;

	private subscriptions: Subscription[] = [];

	constructor(
		private matDialog: MatDialog,
		private matSnackbar: MatSnackBar,
		private authService: AuthService,
		private postService: PostService,
		private notificationService: NotificationService
	) { }

	ngOnInit(): void {
		this.authUserId = this.authService.getAuthUserId();
		this.postResponse = {
			...this.postResponse,
			likedByAuthUser: this.postResponse.favorites.some((data) => data.userId === this.authUserId)
		}
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}

	openLikeDialog(): void {
		this.matDialog.open(PostLikeDialogComponent, {
			data: this.postResponse,
			minWidth: '400px',
			maxWidth: '700px'
		});
	}

	openCommentDialog(): void {
		const dialogRef = this.matDialog.open(PostCommentDialogComponent, {
			data: this.postResponse,
			autoFocus: false,
			minWidth: '500px',
			maxWidth: '700px'
		});

		dialogRef.componentInstance.updatedCommentEvent.subscribe(
			data => this.postDeletedEvent.emit()
		);
	}

	openShareDialog(): void {
		const dialogRef = this.matDialog.open(PostShareDialogComponent, {
			data: this.postResponse,
			autoFocus: false,
			minWidth: '500px',
			maxWidth: '700px'
		});
	}

	openShareConfirmDialog(): void {
		this.matDialog.open(ShareConfirmDialogComponent, {
			data: this.postResponse,
			autoFocus: false,
			minWidth: '500px',
			maxWidth: '700px'
		});
	}

	openPostEditDialog(): void {
		const dialogRef = this.matDialog.open(PostDialogComponent, {
			data: this.postResponse,
			autoFocus: false,
			minWidth: '500px',
			maxWidth: '900px'
		});
	}

	openPostDeleteConfirmDialog(): void {
		const dialogRef = this.matDialog.open(ConfirmationDialogComponent, {
			data: 'Bạn có chắc chắn muốn xóa bài viết này không?',
			autoFocus: false,
			width: '500px'
		});

		dialogRef.afterClosed().subscribe(
			result => {
				if (result) this.deletePost(this.postResponse.id);
			}
		);
	}

	deletePost(postId: number): void {
		const dialogRef = this.matDialog.open(WaitingDialogComponent, {
			data: 'Xin vui lòng đợi trong khi chúng tôi xóa bài viết.',
			width: '500px',
			disableClose: true
		});

		this.subscriptions.push(
			this.postService.deletePost(postId, this.postResponse).subscribe({
				next: (response: any) => {
					this.postDeletedEvent.emit(this.postResponse);
					dialogRef.close();
					this.matSnackbar.openFromComponent(SnackbarComponent, {
						data: 'Xóa bài viết thành công',
						panelClass: ['bg-success'],
						duration: 5000
					});
				},
				error: (errorResponse: HttpErrorResponse) => {
					this.matSnackbar.openFromComponent(SnackbarComponent, {
						data: AppConstants.snackbarErrorContent,
						panelClass: ['bg-danger'],
						duration: 5000
					});
					dialogRef.close();
				}
			})
		);
	}

	likeOrUnlikePost(likedByAuthUser: boolean, postResponse: any) {
		console.log(postResponse);
		if (likedByAuthUser) {
      const favoriteId = this.postResponse.favorites.filter((data) => data.userId === this.authUserId)[0].id;
			this.subscriptions.push(
				this.postService.unlikePost(favoriteId).subscribe({
					next: (response: any) => {
            			this.postDeletedEvent.emit(this.postResponse);
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
		} else {
			this.subscriptions.push(
				this.postService.likePost(this.postResponse.id).subscribe({
					next: (response: any) => {
            			this.postDeletedEvent.emit(this.postResponse);
						if(postResponse.author.id !== this.authService.getAuthUserId()) {
							this.notificationService.sentNotification(postResponse.author.id, 'like', postResponse.id).subscribe({});
						}
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
}
