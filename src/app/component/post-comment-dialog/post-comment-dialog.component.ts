import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { AppConstants } from 'src/app/common/app-constants';
import { Comment } from 'src/app/model/comment';
import { CommentResponse } from 'src/app/model/comment-response';
import { Post } from 'src/app/model/post';
import { User } from 'src/app/model/user';
import { AuthService } from 'src/app/service/auth.service';
import { CommentService } from 'src/app/service/comment.service';
import { PostService } from 'src/app/service/post.service';
import { environment } from 'src/environments/environment';
import { CommentLikeDialogComponent } from '../comment-like-dialog/comment-like-dialog.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { PostLikeDialogComponent } from '../post-like-dialog/post-like-dialog.component';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { NotificationService } from 'src/app/service/notification.service';

@Component({
	selector: 'app-post-comment-dialog',
	templateUrl: './post-comment-dialog.component.html',
	styleUrls: ['./post-comment-dialog.component.css']
})
export class PostCommentDialogComponent implements OnInit, OnDestroy {
	@Output() updatedCommentEvent = new EventEmitter<number>();
	@Output() newItemEvent = new EventEmitter<string>();
	authUserId: number;
	commentResponseList: any[] = [];
	resultPage: number = 1;
	resultSize: number = 5;
	hasMoreResult: boolean = false;
	fetchingResult: boolean = false;
	creatingComment: boolean = false;
	commentFormGroup: FormGroup;
	defaultProfilePhotoUrl = environment.defaultProfilePhotoUrl;
	defaultProfilePhoto = environment.defaultProfilePhoto;

	private subscriptions: Subscription[] = [];

	constructor(
		@Inject(MAT_DIALOG_DATA) public dataPost: any,
		private authService: AuthService,
		private postService: PostService,
		private commentService: CommentService,
		private formBuilder: FormBuilder,
		private matDialog: MatDialog,
		private matSnackbar: MatSnackBar,
		private notificationService: NotificationService
	) { }

	get content() { return this.commentFormGroup.get('content') }

	ngOnInit(): void {
		this.authUserId = this.authService.getAuthUserId();

		this.commentFormGroup = this.formBuilder.group({
			content: new FormControl('', [Validators.required, Validators.maxLength(1024)])
		});

		this.loadComments();
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}

	loadComments(): void {
    this.commentService.getCommentByPostId(this.dataPost.id).subscribe({
      next: (resultList: CommentResponse[]) => {
        this.commentResponseList = [...resultList];
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

	createNewComment(): void {
		this.creatingComment = true;
		this.subscriptions.push(
			this.postService.createPostComment(this.dataPost.id, this.content.value).subscribe({
				next: (newComment: any) => {
					this.commentFormGroup.reset();
					Object.keys(this.commentFormGroup.controls).forEach(key => {
						this.commentFormGroup.get(key).setErrors(null) ;
					});
					this.commentResponseList.unshift(newComment);
					this.updatedCommentEvent.emit();
					this.creatingComment = false;
					console.log(newComment);
					if(this.dataPost.author.id !== this.authService.getAuthUserId()) {
						this.notificationService.sentNotification(this.dataPost.author.id, 'comment', this.dataPost.id).subscribe({});
					}
				},
				error: (errorResponse: HttpErrorResponse) => {
					this.matSnackbar.openFromComponent(SnackbarComponent, {
						data: AppConstants.snackbarErrorContent,
						panelClass: ['bg-danger'],
						duration: 5000
					});
					this.creatingComment = false;
				}
			})
		);
	}

  deleteComment(commentResponse: any) {
		this.subscriptions.push(
			this.commentService.deleteComment(commentResponse.id).subscribe({
				next: (response: any) => {
          this.loadComments();
					this.updatedCommentEvent.emit();
					this.matSnackbar.openFromComponent(SnackbarComponent, {
						data: 'Xóa bình luận thành công',
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

	openCommentLikeDialog(comment: Comment): void {
		this.matDialog.open(CommentLikeDialogComponent, {
			data: comment,
			minWidth: '500px',
			maxWidth: '700px'
		});
	}

	likeOrUnlikeComment(commentResponse: CommentResponse) {
		if (commentResponse.likedByAuthUser) {
			this.subscriptions.push(
				this.commentService.unlikeComment(commentResponse.comment.id).subscribe({
					next: (response: any) => {
						const targetCommentResponse = this.commentResponseList.find(cR => cR === commentResponse);
						targetCommentResponse.likedByAuthUser = false;
						targetCommentResponse.comment.likeCount--;
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
				this.commentService.likeComment(commentResponse.comment.id).subscribe({
					next: (response: any) => {
						const targetCommentResponse = this.commentResponseList.find(cR => cR === commentResponse);
						targetCommentResponse.likedByAuthUser = true;
						targetCommentResponse.comment.likeCount++;
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

	openCommentDeleteConfirmDialog(commentResponse: CommentResponse): void {
		const dialogRef = this.matDialog.open(ConfirmationDialogComponent, {
			data: 'Bạn có chắc chắn muốn xóa bình luận này không?',
			autoFocus: false,
			width: '500px'
		});

		dialogRef.afterClosed().subscribe(
			result => {
				if (result) this.deleteComment(commentResponse);
			}
		);
	}
}
