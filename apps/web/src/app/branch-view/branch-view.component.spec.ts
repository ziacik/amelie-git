import { Branch } from '@amelie-git/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { BranchViewComponent } from './branch-view.component';

describe('BranchViewComponent', () => {
	let component: BranchViewComponent;
	let fixture: ComponentFixture<BranchViewComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [BranchViewComponent],
			imports: [MatListModule, MatIconModule],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(BranchViewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('shows a list of branches', () => {
		const branches = [new Branch('master')];
		component.branches = branches;
		fixture.detectChanges();
		expect(fixture.debugElement.nativeElement.textContent).toContain('master');
	});
});
