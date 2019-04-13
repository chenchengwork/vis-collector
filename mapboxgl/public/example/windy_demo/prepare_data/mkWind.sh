#!/bin/bash

GFS_DATE="20161120"
GFS_TIME="00"; # 00, 06, 12, 18

DIR=`dirname $0`
echo ${1}/${GFS_DATE}${GFS_TIME}
node ${DIR}/prepare.js ${1}/${GFS_DATE}${GFS_TIME}

#rm tmp.json
