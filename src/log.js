// Print to both stdout and stderr
export function log(...args) {
	console.log(...args)
	console.error(...args)
}
