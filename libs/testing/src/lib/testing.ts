import { Observable } from 'rxjs';

export async function wait(millis = 0): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, millis);
	});
}

export async function waitFor<T>(observable: Observable<T>, action: () => void): Promise<T> {
	return new Promise((resolve, reject) => {
		observable.subscribe((value) => resolve(value), reject);
		try {
			action();
		} catch (e) {
			reject(e);
		}
	});
}
