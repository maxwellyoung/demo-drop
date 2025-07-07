# Use a lightweight official Go image to build the application
# We are using debian-slim as it is a good compromise between size and features
FROM debian:slim-bullseye as base

# Set an argument for the PocketBase version
ARG PB_VERSION=0.22.18

# Set the working directory
WORKDIR /pb

# Copy the local pocketbase executable and migrations
# This assumes you have the pocketbase binary at ./pocketbase/pocketbase-exec
COPY ./pocketbase/pocketbase-exec /pb/pocketbase
COPY ./pocketbase/pb_migrations /pb/pb_migrations

# Make the pocketbase binary executable
RUN chmod +x /pb/pocketbase

# Expose the default pocketbase port
EXPOSE 8090

# Start pocketbase
# The --dir flag is important for Fly.io to persist the data
# Fly.io will mount a volume at /pb_data
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb_data"] 