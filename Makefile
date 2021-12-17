build:
	docker compose build

# *** NOT USED *** #
#python-md2notion:
#	echo "page_url: ${PAGE_URL}"
#	docker compsoe run webapp /bin/bash python -m md2notion ${TOKEN_V2} ${PAGE_URL}
#python-start:
#	docker compose up python --build
#python-run:
#	docker compose run python /bin/bash
# *** Used *** #

node-start:
	docker compose up node --build

node-run:
	docker compose run node /bin/bash

node-test:
	node src/test.cjs


