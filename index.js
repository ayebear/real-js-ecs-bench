import { World } from 'picoes'
import si from 'systeminformation'

const NUM_COMPS = 200
const NUM_ENTITIES = 1000
const EXPECTED_COUNT = 25150000

// TODO: Move to separate file
// TODO: Run in separate node.js instance, sequentially
const picoBench = {
	name: 'picoes',
	setup(nc) {
		this.world = new World()
		const components = []
		for (let i = 0; i < nc; ++i) {
			components.push(i.toString())
		}
		return {
			components,
			addEntity: () => {
				return this.world.entity()
			},
			removeEntity: entity => {
				entity.destroy()
			},
			addComponent: (entity, component, value) => {
				entity.set(component, value)
			},
			removeComponent: (entity, component) => {
				entity.remove(component)
			},
			queryEntities: (comps, callback) => {
				this.world.each(comps, callback)
			},
		}
	},
}

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
	// TODO: Add new entities with unique combinations of components
	// Use hash of index to determine which components to set
	const hits = []
	for (let e = 0; e < NUM_ENTITIES; ++e) {
		const entity = addEntity()
		// sha512(e) => use each bit for each component index
		entities.push(entity)
		if (e % 2 === 0) {
			// hits.push(comps)
		}
	}
	// Do more queries, ~50% hit using hash combos above
	for (const hit of hits) {
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

// Print to both stdout and stderr
function log(...args) {
	console.log(...args)
	console.error(...args)
}

async function main() {
	const cpu = await si.cpu()
	log(`CPU: ${cpu.manufacturer} ${cpu.brand} (${cpu.cores}-core)`)
	runBench(picoBench)
}

await main()