export function throwIfNonSuccessResponse(res: Response) {
	let errorKind: 'client' | 'server';
	if (res.status >= 500) {
		errorKind = 'server';
	} else if (res.status >= 400) {
		errorKind = 'client';
	}
	if (errorKind) {
		throw new Error(`Fetch error: ${errorKind}, status: ${res.status}`);
	}
}
