import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { ElectronService } from '../electron.service';
import { StartPageComponent } from './start-page.component';

describe('StartPageComponent', () => {
	let fixture: ComponentFixture<StartPageComponent>;
	let component: StartPageComponent;
	let electronService: ElectronService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [StartPageComponent],
			providers: [ElectronService],
		}).compileComponents();
	});

	beforeEach(() => {
		electronService = TestBed.inject(ElectronService);
		jest.spyOn(electronService, 'invoke').mockImplementation((channel) => {
			if (channel === 'open-repository') {
				return of('/path/to/repository');
			}
			return throwError(new Error('Some error'));
		});

		fixture = TestBed.createComponent(StartPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	describe('open repository button', () => {
		it('invokes open-repository message', () => {
			const button = fixture.debugElement.query(By.css('#open-repository')).nativeElement;
			button.click();
			expect(electronService.invoke).toHaveBeenCalledWith('open-repository');
		});

		it('emits an repositoryOpened event if the result is not empty', () => {
			let repositoryOpenedValue: string = undefined;
			component.repositoryOpened.subscribe((value: string) => (repositoryOpenedValue = value));
			const button = fixture.debugElement.query(By.css('#open-repository')).nativeElement;
			button.click();
			expect(repositoryOpenedValue).toEqual('/path/to/repository');
		});

		it('does not emits repositoryOpened event if the result is null', () => {
			let repositoryOpenedValue = 'should-stay-this';
			component.repositoryOpened.subscribe((value: string) => (repositoryOpenedValue = value));
			(electronService.invoke as jest.Mock).mockReturnValue(of(null));
			const button = fixture.debugElement.query(By.css('#open-repository')).nativeElement;
			button.click();
			expect(repositoryOpenedValue).toEqual('should-stay-this');
		});
	});
});
