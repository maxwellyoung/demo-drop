# Use a lightweight official Go image to build the application
# We are using alpine as it is a very minimal image
FROM alpine:latest as base

# Set an argument for the PocketBase version
ARG PB_VERSION=0.22.18

# Install curl and unzip to download and extract PocketBase
RUN apk add --no-cache curl unzip

# Set the working directory
WORKDIR /pb

# Download and unzip the correct PocketBase binary for Linux AMD64
RUN curl -L "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" -o pocketbase.zip && \
    unzip pocketbase.zip && \
    rm pocketbase.zip

# Copy only the migrations from the local machine
COPY ./pocketbase/pb_migrations ./pb_migrations

# The 'pocketbase' executable is now inside the WORKDIR from the unzip command
# Make it executable
RUN chmod +x ./pocketbase

# Expose the default pocketbase port
EXPOSE 8090

# Start pocketbase
# The --dir flag is important for Fly.io to persist the data
# Fly.io will mount a volume at /pb_data
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb_data"] 