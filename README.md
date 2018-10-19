# A simple image cataloguer that stores results in GUN

## Getting started
copy the images you want to classify to `public/images` you probably do not
want to add those to git.

```sh
# install deps
yarn
# run the GUN server or set GUN_URL to an external one
node src/gun.server.js &
# start the dev server
yarn start
```

## Deploying
you can deploy this site easily to any hosting, note that you will *NEED* a
GUN server (until browsers can actually do p2p).

## Querying results
to get results you need to get to the gunDB, just get the node set in the
`GUN_CLASS` in `src/gun.js`
