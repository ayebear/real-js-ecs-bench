import EntityManager from 'tiny-ecs/lib/EntityManager.js'

export default nc => {
	const em = new EntityManager()
	const components = []
	for (let i = 0; i < nc; ++i) {
		components.push(
			Function(`
                return function C${i} (value = '') {
                    this.value = value;
                }
        `)()
		)
	}
	return {
		components,
		addEntity: () => {
			return em.createEntity()
		},
		removeEntity: entity => {
			entity.remove()
		},
		addComponent: (entity, component, value) => {
			entity.addComponent(component).value = value
		},
		removeComponent: (entity, component) => {
			entity.removeComponent(component)
		},
		queryEntities: (comps, callback) => {
			// TODO: Understand why the counts are off
			// for (const entity of em.queryComponents(comps)) {
			// 	// callback(entity)
			// }
		},
	}
}
