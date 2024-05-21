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

	getNotificationsRequestFriend(): Observable<any[] | HttpErrorResponse> {
		return this.httpClient.get<Notification[] | HttpErrorResponse>(`${this.host}/user/friend-request/me/received-requests`);
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
