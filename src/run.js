import { log } from './log.js'
import { SHA3 } from 'sha3'

const NUM_COMPS = 200
const NUM_ENTITIES = 1000
const NUM_DUPE_HASH_ENTITIES = 10
const EXPECTED_COUNT = 25160000
const hash = new SHA3(256) // Must be more bits than NUM_COMPS

function runBench(bench) {
	const now = Date.now()
	const {
		components,
		addEntity,
		removeEntity,
		addComponent,
		removeComponent,
		queryEntities,
	} = bench.setup(NUM_COMPS, NUM_ENTITIES)
	let count = 0
	// Generate entities
	let entities = []
	for (let e = 0; e < NUM_ENTITIES; ++e) {
		entities.push(addEntity())
	}
	// Add all components to all the entities
	for (let e = 0; e < NUM_ENTITIES; ++e) {
		for (let i = 0; i < NUM_COMPS; ++i) {
			addComponent(entities[e], components[i], `${e}_${i}`)
		}
	}
	// Do queries on the entities
	for (let i = 0; i < NUM_COMPS; ++i) {
		const comps = []
		for (let j = 0; j <= i; ++j) {
			comps.push(components[j])
			queryEntities(comps, entity => {
				++count
			})
		}
	}
	// Remove half the components
	for (let e = 0; e < NUM_ENTITIES; ++e) {
		for (let i = 0; i < NUM_COMPS; i += 2) {
			removeComponent(entities[e], components[i])
		}
	}
	// Do queries on what remains
	for (let i = 1; i < NUM_COMPS; i += 2) {
		const comps = []
		for (let j = 1; j <= i; j += 2) {
			comps.push(components[j])
			queryEntities(comps, entity => {
				++count
			})
		}
	}
	// Try a bunch of missed queries (should be 0)
	for (let i = 0; i < NUM_COMPS; ++i) {
		const comps = []
		for (let j = 0; j <= i; ++j) {
			comps.push(components[j])
			queryEntities(comps, entity => {
				++count
			})
		}
	}
	// Remove half the entities
	const keep = []
	for (let e = 0; e < entities.length; ++e) {
		if (e % 2 === 0) {
			keep.push(entities[e])
		} else {
			removeEntity(entities[e])
		}
	}
	entities = keep
	// Add new entities with unique combinations of components
	// Use hash of index to determine which components to set
	// This is deterministic randomness, the same random for each run and library
	const hits = []
	for (let e = 0; e < NUM_ENTITIES; ++e) {
		const buf = hash.update(e.toString()).digest()
		// Keep track of matching component combinations
		const comps = []
		for (let i = 0; i < NUM_COMPS; ++i) {
			if (getBit(buf, i)) {
				comps.push(components[i])
			}
		}
		hits.push(comps)
		// Create entities with components
		for (let ee = 0; ee < NUM_DUPE_HASH_ENTITIES; ++ee) {
			const entity = addEntity()
			for (const comp of comps) {
				addComponent(entity, comp)
			}
			entities.push(entity)
		}
	}
	// Query for all hash generated component combinations
	for (const hit of hits) {
		queryEntities(hit, entity => {
			++count
		})
	}
	// Do queries again, but with last component not matching, to get all misses
	for (const hit of hits) {
		hit[hit.length - 1] += '_invalid'
		queryEntities(hit, entity => {
			++count
		})
	}
	// Delete entities
	for (const entity of entities) {
		removeEntity(entity)
	}
	// Calculate score (entities processed per millisecond)
	const time = Date.now() - now
	const score = EXPECTED_COUNT / time
	if (count === EXPECTED_COUNT) {
		log(`${bench.name}: PASS, ${score.toFixed(2)} ent/ms`)
	} else {
		log(
			`${bench.name}: FAIL, completed ${count} queries (${(
				(count / EXPECTED_COUNT) *
				100
			).toFixed(5)}%)`
		)
	}
}

// Get bit at index i in buffer
function getBit(buf, i) {
	const byteIndex = Math.floor(i / 8)
	const bitIndex = i % 8
	return (buf[byteIndex] >> bitIndex) & 1
}

async function main() {
	const benchPath = process.argv[2]
	const { default: bench } = await import(benchPath)
	runBench(bench)
}

await main()
