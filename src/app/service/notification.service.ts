import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Notification } from '../model/notification';

@Injectable({
	providedIn: 'root'
})
export class NotificationService {
	private host = environment.apiUrl;

	constructor(private httpClient: HttpClient) { }

	sentNotification(receiverId: number, type: string, postId: string) {
		const body = {
			type: type,
			postId: postId
		}
		return this.httpClient.post<any | HttpErrorResponse>(`${this.host}/notification/sent/${receiverId}`, body);
	}

	getAllNotification() {
		return this.httpClient.get<any | HttpErrorResponse>(`${this.host}/notification/getAll`);
	}

	markAllSeen():  Observable<any | HttpErrorResponse> {
		return this.httpClient.post<any | HttpErrorResponse>(`${this.host}/notifications/mark-seen`, null);
	}

	markAsRead(notificationId: number):  Observable<any | HttpErrorResponse> {
		return this.httpClient.post<any | HttpErrorResponse>(`${this.host}/notifications/${notificationId}/mark-read`, null);
	}

	markAllRead():  Observable<any | HttpErrorResponse> {
		return this.httpClient.post<any | HttpErrorResponse>(`${this.host}/notifications/mark-read`, null);
	}
}
