import si from 'systeminformation'
import { globby } from 'globby'
import { log } from './log.js'
import spawnAsync from '@expo/spawn-async'

async function main() {
	// Print CPU info
	const cpu = await si.cpu()
	log(`CPU: ${cpu.manufacturer} ${cpu.brand} (${cpu.cores}-core)`)
	// Run each benchmark sequentially in a dedicated node instance
	const benches = await globby('./bench/**.js', { cwd: 'src' })
	for (const bench of benches) {
		await spawnAsync('node', ['src/run.js', bench], { stdio: 'inherit' })
	}
}

await main()
