import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { MessageService } from 'src/app/service/message.service';

@Component({
	selector: 'app-message',
	templateUrl: './message.component.html',
	styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit, OnDestroy {
	newMessage$: Observable<string>;
	messages: any[] = [];

	constructor(private messageService: MessageService) { }

	ngOnInit(): void {
		this.messageService.getNewMessage().subscribe((message: any) => {
			this.messages.push(message);
		})
	}

	sendMessage() {
		const message = '';
		this.messageService.sendMessage(message);
	}

	ngOnDestroy(): void {

	}
}
