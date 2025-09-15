#!/bin/sh
echo "Running database migrations..."
npx prisma db push

echo "Starting app... 2"
node /app/dist/main
