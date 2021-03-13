#!/bin/sh
echo create EWA.js
cat `dirname $0`/src/core/*.js  > `dirname $0`/EWA.js

echo create EWA_UI.js
cat `dirname $0`/src/ui/*.js > `dirname $0`/EWA_UI.js

echo create EWA_FRAME.js
cat `dirname $0`/src/frames/*.js > `dirname $0`/EWA_FRAME.js

echo create EWA_MISC.js
cat `dirname $0`/src/misc/*.js > `dirname $0`/EWA_MISC.js

echo create EWA_ALL.js
cat `dirname $0`/EWA.js `dirname $0`/EWA_UI.js\
 `dirname $0`/EWA_FRAME.js  `dirname $0`/EWA_MISC.js > `dirname $0`/EWA_ALL.js
