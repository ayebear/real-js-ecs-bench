import { World } from 'picoes'

export default {
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
