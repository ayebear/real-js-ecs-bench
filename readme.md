# Real World JS ECS Benchmarks

The goal of this project is to benchmark the performance and usability of JS ECS libraries for use in real world projects. The test checks performance when many systems and component types are in use. Some ECS's may completely fail the test, which is to be expected, as some use 32-bit integers with bitmasking or have other limiting factors.

Please also see:

-   [https://github.com/ddmills/js-ecs-benchmarks](https://github.com/ddmills/js-ecs-benchmarks)
-   [https://github.com/noctjs/ecs-benchmark](https://github.com/noctjs/ecs-benchmark)

## Latest results

[results.txt](results.txt)

## Run

```
npm ci
npm run bench
```

Results are written to `results.txt`.

## Benchmark operations

See [src/run.js](src/run.js) for constants and details.

### Initial dataset

Create entities and add components.

-   Generate NUM_ENTITIES, with random single component
-   Generate NUM_ENTITIES, with random NUM_SOME_COMPS components
-   Generate NUM_ENTITIES, with all random (hash) components

### Queries

Query for entities by specifying components. Aim for n% hits spread out with mod. In each query, add toRemove component.

-   Query for 1/TO_REMOVE_MOD of A
-   Query for 1/TO_REMOVE_MOD of B
-   Query for 1/TO_REMOVE_MOD of C

### More dataset operations

-   Generate NUM_ENTITIES, with all components
-   Query for toRemove, and delete these entities
-   Query for each component 1-by-1 and remove all components except the matched one
-   Query for each component 1-by-1 and delete the remaining entities
