import { World } from 'picoes'

export default nc => {
	const world = new World()
	const components = []
	for (let i = 0; i < nc; ++i) {
		components.push(i.toString())
	}
	return {
		components,
		addEntity: () => {
			return world.entity()
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
			world.each(comps, (_, entity) => {
				callback(entity)
			})
		},
	}
}
