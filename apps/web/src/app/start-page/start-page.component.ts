import { Component, EventEmitter, Output } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter } from 'rxjs/operators';
import { ElectronService } from '../electron.service';

@UntilDestroy()
@Component({
	selector: 'app-start-page',
	templateUrl: './start-page.component.html',
	styleUrls: ['./start-page.component.scss'],
})
export class StartPageComponent {
	@Output() repositoryOpened = new EventEmitter<string>();

	constructor(private electronService: ElectronService) {}

	openRepository() {
		this.electronService
			.invoke('open-repository')
			.pipe(untilDestroyed(this), filter(Boolean))
			.subscribe((value: string) => this.repositoryOpened.emit(value));
	}
}
