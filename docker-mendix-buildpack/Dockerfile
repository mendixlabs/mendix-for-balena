# Dockerfile to create a Mendix Docker image based on either the source code or
# Mendix Deployment Archive (aka mda file)
#
# Copied from original Dockerfile
# Author: Mendix Digital Ecosystems, digitalecosystems@mendix.com
# Version: 1.5
FROM balenalib/raspberrypi3-ubuntu-openjdk:8-latest-run
#This version does a full build originating from the Ubuntu Docker images
LABEL Author="J.W. Lagendijk & C.B.L. Waal"
LABEL maintainer="jelte.lagendijk@mendix.com"

# When doing a full build: install dependencies & remove package lists
RUN apt-get -q -y update && \
 DEBIAN_FRONTEND=noninteractive apt-get upgrade -q -y && \
 DEBIAN_FRONTEND=noninteractive apt-get install -q -y python3 wget curl libgdiplus libpq5 locales python3-distutils git i2c-tools && \
 rm -rf /var/lib/apt/lists/*

# Set the locale
RUN locale-gen en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LC_ALL en_US.UTF-8

# Build-time variables
ARG BUILD_PATH=project
ARG DD_API_KEY

# Checkout CF Build-pack here
RUN mkdir -p buildpack/.local && \
   (wget -qO- https://github.com/mxclyde/cf-mendix-buildpack/archive/pi.tar.gz \
   | tar xvz -C buildpack --strip-components 1)

# Copy python scripts which execute the buildpack (exporting the VCAP variables)
COPY scripts/compilation /buildpack

# Add the buildpack modules
ENV PYTHONPATH "/buildpack/lib/"

# Add Pi4J to control Raspberry Pi
COPY utils/wiringpi-2.46-1.deb /tmp
COPY utils/pi4j-1.2-SNAPSHOT.deb /tmp
RUN dpkg -i /tmp/wiringpi-2.46-1.deb
RUN dpkg -i /tmp/pi4j-1.2-SNAPSHOT.deb
RUN rm -rf /tmp/*.deb

# Create the build destination
RUN mkdir build cache
RUN rm -rf /build/*
COPY $BUILD_PATH build

# Compile the application source code and remove temp files
WORKDIR /buildpack
RUN chmod +x /buildpack/compilation
RUN "/buildpack/compilation" /build /cache && \
  rm -fr /cache /tmp/javasdk /tmp/opt

# Expose nginx port
ENV PORT 80
#EXPOSE 81
#EXPOSE 82
#EXPOSE 83

RUN mkdir -p "/.java/.userPrefs/com/mendix/core"
RUN mkdir -p "/root/.java/.userPrefs/com/mendix/core"
RUN ln -s "/.java/.userPrefs/com/mendix/core/prefs.xml" "/root/.java/.userPrefs/com/mendix/core/prefs.xml"

# Start up application
COPY scripts/ /build
WORKDIR /build
RUN chmod u+x startup
ENV INITSYSTEM=on
ENTRYPOINT ["/build/startup","/buildpack/start.py"]
