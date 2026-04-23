#!/bin/sh

if [ "$username" = "dev" ] && [ "$password" = "dev" ]; then
  echo "name = Dev User"
  echo "group = system-admin"
  exit 0
fi

exit 1