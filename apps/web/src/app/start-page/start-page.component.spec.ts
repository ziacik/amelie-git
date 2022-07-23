import { IpcService } from '@amelie-git/ipc';
import { wait } from '@amelie-git/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { StartPageComponent } from './start-page.component';

describe('StartPageComponent', () => {
	let fixture: ComponentFixture<StartPageComponent>;
	let component: StartPageComponent;
	let ipcService: IpcService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [StartPageComponent],
			providers: [IpcService],
		}).compileComponents();
	});

	beforeEach(() => {
		ipcService = TestBed.inject(IpcService);
		jest.spyOn(ipcService, 'openRepository').mockResolvedValue('/path/to/repository');
		fixture = TestBed.createComponent(StartPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	describe('open repository button', () => {
		it('calls ipc and emits an repositoryOpened event if the result is not empty', async () => {
			let repositoryOpenedValue = 'should-not-stay-this';
			component.repositoryOpened.subscribe((value: string) => (repositoryOpenedValue = value));
			const button = fixture.debugElement.query(By.css('#open-repository')).nativeElement;
			button.click();
			await wait();
			expect(repositoryOpenedValue).toEqual('/path/to/repository');
		});

		it('calls ipc and does not emit repositoryOpened event if the result is undefined', async () => {
			let repositoryOpenedValue = 'should-stay-this';
			component.repositoryOpened.subscribe((value: string) => (repositoryOpenedValue = value));
			(ipcService.openRepository as jest.Mock).mockResolvedValue(undefined);
			const button = fixture.debugElement.query(By.css('#open-repository')).nativeElement;
			button.click();
			await wait();
			expect(repositoryOpenedValue).toEqual('should-stay-this');
		});
	});
});
