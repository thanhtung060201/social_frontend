import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppConstants } from 'src/app/common/app-constants';
import { Post } from 'src/app/model/post';
import { PostService } from 'src/app/service/post.service';
import { environment } from 'src/environments/environment';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { TagDialogComponent } from '../tag-dialog/tag-dialog.component';

@Component({
	selector: 'app-post-dialog',
	templateUrl: './post-dialog.component.html',
	styleUrls: ['./post-dialog.component.css']
})
export class PostDialogComponent implements OnInit, OnDestroy {
	postFormGroup: FormGroup;
	postPhoto: File;
	imagePreview: string;
	imagePreviewUrl: string;
	postTags: any[] = [];
	creatingPost: boolean = false;

	private subscriptions: Subscription[] = [];

	constructor(
		@Inject(MAT_DIALOG_DATA) public dataPost: any,
		private postService: PostService,
		private formBuilder: FormBuilder,
		private router: Router,
		private matDialog: MatDialog,
		private matDialogRef: MatDialogRef<PostDialogComponent>,
		private matSnackbar: MatSnackBar) { }

	get content() { return this.postFormGroup.get('content'); }

	ngOnInit(): void {
		this.postFormGroup = this.formBuilder.group({
			content: new FormControl(((this.dataPost && this.dataPost.body) ? this.dataPost.body : ''), [Validators.maxLength(4096)])
		});

		if (this.dataPost) {
			if (this.dataPost.imagePath) {
				this.imagePreview = this.dataPost.imagePath;
			}

			this.populateWithPostTags();
		}
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}

	previewPostPhoto(event: any): void {
		if (event.target.files) {
			this.postPhoto = event.target.files[0];
			const reader = new FileReader();
			reader.readAsDataURL(this.postPhoto);
			reader.onload = (e: any) => {
				this.imagePreviewUrl = e.target.result;
			}
		}
	}

	openPostPhotoDeleteConfirmDialog(): void {
		const dialogRef = this.matDialog.open(ConfirmationDialogComponent, {
			data: 'Bạn có chắc chắn muốn xóa ảnh?',
			width: '500px',
			autoFocus: false
		});

		dialogRef.afterClosed().subscribe(
			result => {
				if (result) {
					this.deletePostPhoto();
				}
			}
		);
	}

	openAddTagDialog(e: Event): void {
		e.preventDefault();

		const dialogRef = this.matDialog.open(TagDialogComponent, {
			width: '500px',
			autoFocus: true
		});

		dialogRef.afterClosed().subscribe(
			result => {
				if (result) {
					const tagIndex = this.postTags.findIndex(tN => tN === result.tagName);
					if (tagIndex >= 0) {
						this.postTags[tagIndex].action = 'add'
					} else {
						this.postTags.push({
							tagName: result.tagName,
							action: 'add'
						})
					}
				}
				console.log(this.postTags)
			}
		);
	}

	removeTag(tagName: string): void {
		const tagIndex = this.postTags.findIndex(tN => tN === tagName);
		if (this.postTags[tagIndex].action === 'saved') {
			this.postTags[tagIndex].action = 'remove';
		} else {
			this.postTags.splice(tagIndex, 1);
		}
		console.log(this.postTags)
	}

	handlePostSubmit(): void {
		if (this.content.value.length <= 0 && !this.postPhoto) {
			this.matSnackbar.openFromComponent(SnackbarComponent, {
				data: 'Post cannot be empty.',
				panelClass: ['bg-danger'],
				duration: 5000
			});
			return;
		}

		if (this.dataPost) {
			this.updatePost();
		} else {
			this.createNewPost();
		}
	}

	private createNewPost(): void {
		if (!this.creatingPost) {
			this.creatingPost = true;
			const dataTagsSave = [...this.postTags.map((tag: any) => tag.tagName)];
			this.subscriptions.push(
				this.postService.createNewPost(this.content.value, dataTagsSave).subscribe({
					next: (createdPost: any) => {
						if (this.postPhoto) {
							this.postService.updateImageByPostId(createdPost.id, this.postPhoto).subscribe();
						}
						if(createdPost.tags.length) {
							createdPost.tags.forEach((tag: any) => {
								this.postService.createTag(createdPost.id, tag).subscribe();
							})
						}
						this.matDialogRef.close();
						this.matSnackbar.openFromComponent(SnackbarComponent, {
							data: 'Post created successfully.',
							duration: 5000
						});
						this.creatingPost = false;
						this.postPhoto = null;
            this.router.navigateByUrl(`/posts/${createdPost.id}`);
						// this.router.navigateByUrl(`/posts/${createdPost.id}`).then(() => {
						// 	window.location.reload();
						// });
					},
					error: (errorResponse: HttpErrorResponse) => {
						this.matSnackbar.openFromComponent(SnackbarComponent, {
							data: AppConstants.snackbarErrorContent,
							panelClass: ['bg-danger'],
							duration: 5000
						});
						this.creatingPost = false;
					}
				})
			);
		}
	}

	private updatePost(): void {
    const dataTagsSave = [...this.postTags.map((tag: any) => tag.tagName)];
		this.subscriptions.push(
			this.postService.updatePost({ ...this.dataPost, imagePath: this.postPhoto ? this.postPhoto : this.dataPost.imagePath, body: this.content.value, tags: dataTagsSave }).subscribe({
				next: (createdPost: any) => {
          if (this.postPhoto) {
            this.postService.updateImageByPostId(createdPost.id, this.postPhoto).subscribe();
          }
          if(createdPost.tags.length) {
            createdPost.tags.forEach((tag: any) => {
              this.postService.createTag(createdPost.id, tag).subscribe();
            })
          }
					this.matDialogRef.close();
					this.matSnackbar.openFromComponent(SnackbarComponent, {
						data: 'Cập nhật bài viết thành công',
						duration: 5000
					});
					this.router.navigateByUrl(`/posts/${createdPost.id}`);
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

	private deletePostPhoto(): void {
    this.imagePreview = null;
    this.postPhoto = null;
    this.imagePreviewUrl = null;
    this.matSnackbar.openFromComponent(SnackbarComponent, {
      data: 'Xóa ảnh thành công',
      duration: 5000
    });
	}

	private populateWithPostTags(): void {
		this.dataPost.tags.forEach(tag => {
			this.postTags.push({
				tagName: tag.name,
				action: 'saved'
			});
		});
	}
}
