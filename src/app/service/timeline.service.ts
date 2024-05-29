import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PostResponse } from '../model/post-response';
import { Tag } from '../model/tag';

@Injectable({
	providedIn: 'root'
})
export class TimelineService {
	private host = environment.apiUrl;

	constructor(private httpClient: HttpClient) { }

	getPostByUserId(userId: any): Observable<PostResponse[] | HttpErrorResponse> {
		return this.httpClient.get<PostResponse[] | HttpErrorResponse>(`${this.host}/newfeed/user/${userId}`);
	}

	getTimelinePosts(): Observable<PostResponse[] | HttpErrorResponse> {
		return this.httpClient.get<PostResponse[] | HttpErrorResponse>(`${this.host}/newfeed`);
	}

	// getAllPostWithFriend() {
	// 	return this.httpClient.get<PostResponse[] | HttpErrorResponse>(`${this.host}/newfeed/friend`);
	// }

	getTimelineTags(): Observable<Tag[] | HttpErrorResponse> {
		return this.httpClient.get<Tag[] | HttpErrorResponse>(`${this.host}/tag`);
	}
}
