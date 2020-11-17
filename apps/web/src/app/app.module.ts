import { NgModule } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { CommitLineComponent } from './commit-line/commit-line.component';
import { LogViewComponent } from './log-view/log-view.component';

@NgModule({
	declarations: [AppComponent, LogViewComponent, CommitLineComponent],
	imports: [BrowserModule, BrowserAnimationsModule, MatListModule],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
