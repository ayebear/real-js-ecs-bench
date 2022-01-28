# Real World JS ECS Benchmarks

The goal of this project is to benchmark the performance and usability of JS ECS libraries for use in real world projects. The test checks performance when many systems and component types are in use. Some ECS's may completely fail the test, which is to be expected, as some use 32-bit integers with bitmasking or have other limiting factors.

Please also see:

-   [https://github.com/ddmills/js-ecs-benchmarks](https://github.com/ddmills/js-ecs-benchmarks)
-   [https://github.com/noctjs/ecs-benchmark](https://github.com/noctjs/ecs-benchmark)

# Latest results

[results.txt](results.txt)

# Run

```
npm ci
npm run bench
```

Results are written to `results.txt`.
