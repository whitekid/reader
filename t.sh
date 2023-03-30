#!/usr/bin/env sh
curl 'https://www.technologyreview.kr/a-postmortem-on-design-thinking/' \
	-H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/110.0' \
	-H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8' \
	-H 'Accept-Language: ko-KR,ko;q=0.8,en-US;q=0.5,en;q=0.3' \
	-H 'Accept-Encoding: gzip, deflate, br' \
	-H 'DNT: 1' \
	-H 'Connection: keep-alive' \
	-H 'Upgrade-Insecure-Requests: 1' \
	-H 'Sec-Fetch-Dest: document' \
	-H 'Sec-Fetch-Mode: navigate' \
	-H 'Sec-Fetch-Site: cross-site' \
	-H 'Sec-GPC: 1' \
	-H 'Pragma: no-cache' \
	-H 'Cache-Control: no-cache' \
	-H 'TE: trailers' \
	--output /dev/stdout
