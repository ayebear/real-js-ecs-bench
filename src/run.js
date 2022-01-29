import { log } from './log.js'
import { SHA3 } from 'sha3'

const HASH_SIZE = 256
const NUM_ENTITIES = 10000
const NUM_COMPS = 200 // Must be less than HASH_SIZE
const NUM_SOME_COMPS = HASH_SIZE / 8 - 1
const TO_REMOVE_MOD = 4
const EXPECTED_COUNT = 21954852
const sha3 = new SHA3(HASH_SIZE)

function runBench(bench) {
	// Run benchmark suite
	const now = Date.now()
	const data = bench.setup(NUM_COMPS + 1, NUM_ENTITIES)
	const state = { count: 0, entities: [], toRemove: [] }
	init(data, state)
	runQueries(data, state)
	datasetChallenge(data, state)

	// Calculate score (operations completed per millisecond)
	const time = Date.now() - now
	const score = state.count / time
	if (state.count === EXPECTED_COUNT) {
		log(`${bench.name}: PASS, ${score.toFixed(2)} ops/ms`)
	} else {
		log(
			`${bench.name}: FAIL, ${score.toFixed(2)} ops/ms, completed ${
				state.count
			} ops (${((state.count / EXPECTED_COUNT) * 100).toFixed(5)}%)`
		)
	}
}

function init(data, state) {
	const { components, addEntity, addComponent } = data
	for (let e = 0; e < NUM_ENTITIES; ++e) {
		const bufNum = sha3.update(`num_${e}`).digest()
		const bufAll = sha3.update(`all_${e}`).digest()
		// Single component
		const entitySingle = addEntity()
		const singleComp = components[b2n(bufNum[bufNum.length - 1], NUM_COMPS)]
		++state.count
		addComponent(entitySingle, singleComp)
		// Some components
		const entitySome = addEntity()
		const someComps = []
		for (let i = 0; i < NUM_SOME_COMPS; ++i) {
			const comp = components[b2n(bufNum[i], NUM_COMPS)]
			++state.count
			addComponent(entitySome, comp)
			someComps.push(comp)
		}
		// All random components
		const randComps = []
		const entityAll = addEntity()
		for (let i = 0; i < NUM_COMPS; ++i) {
			if (getBit(bufAll, i)) {
				++state.count
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
	const { components, addComponent, queryEntities } = data
	// Run all stored queries, mark certain entities for removal
	for (const comps of state.toRemove) {
		queryEntities(comps, entity => {
			++state.count
			addComponent(entity, components[components.length - 1])
		})
	}
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
	// Generate entities with all components
	for (let e = 0; e < NUM_ENTITIES; ++e) {
		++state.count
		const entity = addEntity()
		for (let i = 0; i < NUM_COMPS; ++i) {
			++state.count
			addComponent(entity, components[i], `${e}_${i}`)
		}
	}
	// Delete entities marked for deletion
	queryEntities(components[components.length - 1], entity => {
		++state.count
		removeEntity(entity)
	})
	// Remove all other components
	for (let i = 0; i < NUM_COMPS; ++i) {
		queryEntities(components[i], entity => {
			++state.count
			for (let j = 0; j < NUM_COMPS; ++j) {
				if (j === i) {
					continue
				}
				++state.count
				removeComponent(entity, components[j])
			}
		})
	}
	// Remove remaining entities
	for (let i = 0; i < NUM_COMPS; ++i) {
		queryEntities(components[i], entity => {
			++state.count
			removeEntity(entity)
		})
	}
}

// Get bit at index i in buffer
function getBit(buf, i) {
	const byteIndex = Math.floor(i / 8)
	const bitIndex = i % 8
	return (buf[byteIndex] >> bitIndex) & 1
}

// Byte to number
function b2n(byte, max) {
	const ratio = max / 256
	return Math.floor(byte * ratio)
}

async function main() {
	const benchPath = process.argv[2]
	const { default: bench } = await import(benchPath)
	if (bench.enable === false) {
		log(`${bench.name}: SKIPPED`)
		return
	}
	runBench(bench)
}

await main()
