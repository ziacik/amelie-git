import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTreeModule } from '@angular/material/tree';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { BranchViewComponent } from './branch-view/branch-view.component';
import { CommitFilesViewComponent } from './commit-files-view/commit-files-view.component';
import { CommitLineComponent } from './commit-line/commit-line.component';
import { LogViewComponent } from './log-view/log-view.component';
import { StartPageComponent } from './start-page/start-page.component';
import { DiffViewComponent } from './diff-view/diff-view.component';

@NgModule({
	declarations: [
		AppComponent,
		LogViewComponent,
		CommitLineComponent,
		StartPageComponent,
		BranchViewComponent,
		CommitFilesViewComponent,
		DiffViewComponent,
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		MatListModule,
		MatButtonModule,
		MatIconModule,
		MatSidenavModule,
		MatTreeModule,
		MatRippleModule,
	],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
