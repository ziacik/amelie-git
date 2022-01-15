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

	openRepository(): void {
		this.electronService
			.invoke<string>('open-repository')
			.pipe<string, string>(untilDestroyed(this), filter<string>(Boolean))
			.subscribe((value: string) => this.repositoryOpened.emit(value));
	}
}
