export async function wait(millis = 0): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, millis);
	});
}
