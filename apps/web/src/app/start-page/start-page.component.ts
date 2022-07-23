import { IpcService } from '@amelie-git/ipc';
import { Component, EventEmitter, Output } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, from } from 'rxjs';

@UntilDestroy()
@Component({
	selector: 'app-start-page',
	templateUrl: './start-page.component.html',
	styleUrls: ['./start-page.component.scss'],
})
export class StartPageComponent {
	@Output() repositoryOpened = new EventEmitter<string>();

	constructor(private readonly ipcService: IpcService) {}

	openRepository(): void {
		from(this.ipcService.openRepository())
			.pipe(filter(Boolean), untilDestroyed(this))
			.subscribe((value: string) => this.repositoryOpened.emit(value));
	}
}
