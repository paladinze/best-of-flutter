# Best of Flutter

A crawler for Flutter's pub.dev website

For sample result, see `data` directory

## Quick start
Do the followling to get the latest pub.dev ranking stats

```bash
npm i
npm start
```

See `data/output.log` file for results

## Data collected

The data are located in the `data` directory.

### Key Data

The simple crawler collects the following for the **Most Liked** packages

- number of likes
- project health (aka. pub points)
- popularity
- developer
- version
- null safety status
- offical recognition (aka. flutter favourite status)


### Shortlist

The crawler will also collect data for **a subset of packages**, such as

- official packages from `Google`, `Flutter`
- `Firebase` packages
- `state management` packages


### Hybrid landscape

A list of hybrid tech stack used by leading brands.

Currently only stats for the hybrid lanscape in **China** is collected.




