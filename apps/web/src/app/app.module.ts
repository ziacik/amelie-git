import { NgModule } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { CommitLineComponent } from './commit-line/commit-line.component';
import { LogViewComponent } from './log-view/log-view.component';
import { StartPageComponent } from './start-page/start-page.component';

@NgModule({
	declarations: [AppComponent, LogViewComponent, CommitLineComponent, StartPageComponent],
	imports: [BrowserModule, BrowserAnimationsModule, MatListModule, MatButtonModule],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
