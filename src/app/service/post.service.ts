import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CommentResponse } from '../model/comment-response';
import { Post } from '../model/post';
import { PostResponse } from '../model/post-response';
import { User } from '../model/user';

@Injectable({
	providedIn: 'root'
})
export class PostService {
	authUser: User;
	private host = environment.apiUrl;

	constructor(private httpClient: HttpClient) { }

	getPostById(postId: number): Observable<PostResponse | HttpErrorResponse> {
		return this.httpClient.get<PostResponse | HttpErrorResponse>(`${this.host}/newfeed/${postId}`);
	}

	createNewPost(content: string, tags: any): Observable<Post | HttpErrorResponse> {
		// const formData = new FormData();
		// formData.append('content', content);
		// formData.append('postPhoto', postPhoto);
		// formData.append('postTags', JSON.stringify(postTags));
		return this.httpClient.post<Post | HttpErrorResponse>(`${this.host}/newfeed`, {
			post: {
				body: content
			},
			tags: tags
		});
	}

	updatePost(post: any): Observable<any | HttpErrorResponse> {
		// const formData = new FormData();
		// formData.append('content', content);
		// formData.append('postPhoto', postPhoto);
		// formData.append('postTags', JSON.stringify(postTags));
		return this.httpClient.put<Post | HttpErrorResponse>(`${this.host}/newfeed/${post.id}`, post);
	}

	deletePost(postId: any, post: any) {
		return this.httpClient.delete<any>(`${this.host}/newfeed/delete/${postId}`);
	}

	updateImageByPostId(id: string, fileImage: any) {
		const formData = new FormData();
		formData.append('file', fileImage);
		return this.httpClient.post<any>(`${this.host}/newfeed/upload/${id}`, formData);
	}

	createTag(postId: string, name: string) {
		return this.httpClient.post<any>(`${this.host}/tag`, {
			postId: postId,
			name: name
		});
	}

	getImageNameByPostId(postId: number) {
		return this.httpClient.get<any>(`${this.host}/newfeed/image-name/${postId}`);
	}

	deletePostPhoto(postId: number): Observable<any | HttpErrorResponse> {
		return this.httpClient.post<any | HttpErrorResponse>(`${this.host}/posts/${postId}/photo/delete`, null);
	}

	getPostLikes(postId: number): Observable<any[] | HttpErrorResponse> {
		return this.httpClient.get<any[] | HttpErrorResponse>(`${this.host}/favorite/${postId}`);
	}

	likePost(postId: number): Observable<any | HttpErrorResponse> {
		return this.httpClient.post<any | HttpErrorResponse>(`${this.host}/favorite`, { postId });
	}

	unlikePost(postId: number): Observable<any | HttpErrorResponse> {
		return this.httpClient.delete<any | HttpErrorResponse>(`${this.host}/favorite/${postId}`);
	}

	// deletePost(postId: number, isTypeShare: boolean): Observable<any | HttpErrorResponse> {
	// 	if (isTypeShare) {
	// 		return this.httpClient.post<any | HttpErrorResponse>(`${this.host}/posts/${postId}/share/delete`, null);
	// 	} else {
	// 		return this.httpClient.post<any | HttpErrorResponse>(`${this.host}/posts/${postId}/delete`, null);
	// 	}
	// }

	getPostComments(postId: number, page: number, size: number): Observable<CommentResponse[] | HttpErrorResponse> {
		const reqParams = new HttpParams().set('page', page).set('size', size);
		return this.httpClient.get<CommentResponse[] | HttpErrorResponse>(`${this.host}/posts/${postId}/comments`, { params: reqParams });
	}

	getPostShares(postId: number, page: number, size: number): Observable<PostResponse[] | HttpErrorResponse> {
		const reqParams = new HttpParams().set('page', page).set('size', size);
		return this.httpClient.get<PostResponse[] | HttpErrorResponse>(`${this.host}/posts/${postId}/shares`, { params: reqParams });
	}

	createPostComment(postId: number, content: string): Observable<CommentResponse | HttpErrorResponse> {
		// const formData = new FormData();
		// formData.append('content', content);
		return this.httpClient.post<CommentResponse | HttpErrorResponse>(`${this.host}/comment`, {
			postId: postId,
			content: content
		});
	}

	likePostComment(commentId: number): Observable<any | HttpErrorResponse> {
		return this.httpClient.post<any | HttpErrorResponse>(`${this.host}/posts/comments/${commentId}/like`, null);
	}

	createPostShare(postId: number, content: string): Observable<Post | HttpErrorResponse> {
		const formData = new FormData();
		formData.append('content', content);
		return this.httpClient.post<Post | HttpErrorResponse>(`${this.host}/posts/${postId}/share/create`, formData);
	}

	getPostsByTag(tagName: string): Observable<PostResponse[] | HttpErrorResponse> {
		return this.httpClient.get<PostResponse[] | HttpErrorResponse>(`${this.host}/posts/tags/${tagName}`);
	}
}
