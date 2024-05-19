import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../model/user';

@Injectable({
	providedIn: 'root'
})
export class CommentService {
	private host = environment.apiUrl;

	constructor(private httpClient: HttpClient) { }

  getCommentByPostId(postId: number,): Observable<any | HttpErrorResponse> {
		return this.httpClient.get<User[] | HttpErrorResponse>(`${this.host}/comment/${postId}`);
	}

  deleteComment(commentId: number): Observable<any | HttpErrorResponse> {
		return this.httpClient.delete<any | HttpErrorResponse>(`${this.host}/comment/${commentId}`);
	}

	likeComment(commentId: number): Observable<any | HttpErrorResponse> {
		return this.httpClient.post<any | HttpErrorResponse>(`${this.host}/posts/comments/${commentId}/like`, null);
	}

	unlikeComment(commentId: number): Observable<any | HttpErrorResponse> {
		return this.httpClient.post<any | HttpErrorResponse>(`${this.host}/posts/comments/${commentId}/unlike`, null);
	}

	getCommentLikes(commentId: number, page: number, size: number): Observable<User[] | HttpErrorResponse> {
		const reqParams = new HttpParams().set('page', page).set('size', size);
		return this.httpClient.get<User[] | HttpErrorResponse>(`${this.host}/posts/comments/${commentId}/likes`, { params: reqParams });
	}
}
