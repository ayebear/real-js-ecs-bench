import { log } from './log.js'
import { SHA3 } from 'sha3'

const HASH_SIZE = 256
const NUM_ENTITIES = 1000
const NUM_COMPS = 200 // Must be less than HASH_SIZE
const NUM_SOME_COMPS = HASH_SIZE / 8 - 1
const TO_REMOVE_MOD = 4
const EXPECTED_COUNT = 25160000
const sha3 = new SHA3(HASH_SIZE)

function runBench(bench) {
	// Run benchmark suite, count entity hits
	const now = Date.now()
	const data = bench.setup(NUM_COMPS, NUM_ENTITIES)
	const state = { count: 0, entities: [], toRemove: [] }
	init(data, state)
	log(state)
	runQueries(data, state)
	datasetChallenge(data, state)

	// Calculate score (entities processed per millisecond)
	const time = Date.now() - now
	const score = EXPECTED_COUNT / time
	if (state.count === EXPECTED_COUNT) {
		log(`${bench.name}: PASS, ${score.toFixed(2)} ent/ms`)
	} else {
		log(
			`${bench.name}: FAIL, completed ${state.count} queries (${(
				(state.count / EXPECTED_COUNT) *
				100
			).toFixed(5)}%)`
		)
	}
}

function init(data, state) {
	const {
		components,
		addEntity,
		removeEntity,
		addComponent,
		removeComponent,
		queryEntities,
	} = data
	for (let e = 0; e < NUM_ENTITIES; ++e) {
		const bufNum = sha3.update(`num_${e}`).digest()
		const bufAll = sha3.update(`all_${e}`).digest()
		// Single component
		const entitySingle = addEntity()
		const singleComp = components[b2n(bufNum[bufNum.length - 1], NUM_COMPS)]
		addComponent(entitySingle, singleComp)
		// Some components
		const entitySome = addEntity()
		const someComps = []
		for (let i = 0; i < NUM_SOME_COMPS; ++i) {
			const comp = components[b2n(bufNum[i], NUM_COMPS)]
			addComponent(entitySome, comp)
			someComps.push(comp)
		}
		// All random components
		const randComps = []
		const entityAll = addEntity()
		for (let i = 0; i < NUM_COMPS; ++i) {
			if (getBit(bufAll, i)) {
				addComponent(entityAll, components[i])
				randComps.push(components[i])
			}
		}
		// Keep track of entities and components
		state.entities.push(entitySingle, entitySome, entityAll)
		if (e % TO_REMOVE_MOD === 0) {
			state.toRemove.push([singleComp], someComps, randComps)
		}
	}
}

function runQueries(data, state) {
	const {
		components,
		addEntity,
		removeEntity,
		addComponent,
		removeComponent,
		queryEntities,
	} = data
}

function datasetChallenge(data, state) {
	const {
		components,
		addEntity,
		removeEntity,
		addComponent,
		removeComponent,
		queryEntities,
	} = data
}

/* 


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
	// Use sha3 of index to determine which components to set
	// This is deterministic randomness, the same random for each run and library
	const hits = []
	for (let e = 0; e < NUM_ENTITIES; ++e) {
		const buf = sha3.update(e.toString()).digest()
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
	// Query for all sha3 generated component combinations
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

*/

// Get bit at index i in buffer
function getBit(buf, i) {
	const byteIndex = Math.floor(i / 8)
	const bitIndex = i % 8
	return (buf[byteIndex] >> bitIndex) & 1
}

// Byte to number
function b2n(byte, max) {
	const ratio = max / 256
	return Math.ceil(byte * ratio)
}

async function main() {
	const benchPath = process.argv[2]
	const { default: bench } = await import(benchPath)
	runBench(bench)
}

await main()
