import {
	addComponent,
	addEntity,
	createWorld,
	defineComponent,
	defineQuery,
	removeComponent,
	removeEntity,
	Types,
} from 'bitecs'

// String handling, could also be more efficient
const strs = new Map()
let id = 0
function id2str(id) {
	return strs.get(id)
}
function str2id(str) {
	if (strs.has(str)) {
		return strs.get(str)
	}
	++id
	strs.set(id, str)
	strs.set(str, id)
	return id
}

export default nc => {
	const world = createWorld()
	const components = []
	for (let i = 0; i < nc; ++i) {
		components.push(defineComponent({ strId: Types.ui32 }))
	}
	return {
		components,
		addEntity: () => {
			return addEntity(world)
		},
		removeEntity: entity => {
			removeEntity(world, entity)
		},
		addComponent: (entity, component, value) => {
			addComponent(world, component, entity)
			component.strId[entity] = str2id(value)
		},
		removeComponent: (entity, component) => {
			removeComponent(world, component, entity)
		},
		queryEntities: (comps, callback) => {
			// This causes major memory usage, so benchmark fails
			// Would have to use bitECS in a way that isn't best practice,
			// which may reduce performance significantly.
			const ents = defineQuery(comps)(world)
			for (const eid of ents) {
				callback(eid)
			}
		},
	}
}
