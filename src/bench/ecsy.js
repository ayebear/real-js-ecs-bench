import { Component, Not, System, Types, World } from 'ecsy'

export default nc => {
	const world = new World()
	const components = []
	for (let i = 0; i < nc; ++i) {
		const comp = class extends Component {
			static schema = {
				value: { type: Types.String },
			}
		}
		components.push(comp)
		world.registerComponent(comp)
	}
	return {
		components,
		addEntity: () => {
			return world.createEntity()
		},
		removeEntity: entity => {
			entity.remove()
		},
		addComponent: (entity, component, value) => {
			if (entity.hasComponent(component)) {
				entity.removeComponent(component)
			}
			entity.addComponent(component, { value })
		},
		removeComponent: (entity, component) => {
			entity.removeComponent(component)
		},
		queryEntities: (comps, callback) => {
			// TODO
		},
	}
}
