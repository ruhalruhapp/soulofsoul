#!/bin/bash
# Launches the crisis-relay mini-service detached from the parent shell.
# Uses setsid + nohup to survive parent shell exit.

cd /home/z/my-project/mini-services/crisis-relay

# Kill any existing instance
pkill -f "crisis-relay/index.ts" 2>/dev/null
sleep 1

# Start fully detached
setsid bash -c 'exec bun run dev </dev/null >/tmp/crisis-relay.log 2>&1' &
disown

# Wait for it to start
sleep 3

# Verify
if curl -s -o /dev/null -w "%{http_code}" --max-time 3 "http://127.0.0.1:3030/socket.io/?EIO=4&transport=polling" 2>&1 | grep -q "200"; then
  echo "crisis-relay: running on port 3030"
  exit 0
else
  echo "crisis-relay: FAILED to start"
  cat /tmp/crisis-relay.log
  exit 1
fi
