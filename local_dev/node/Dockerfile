# syntax=docker/dockerfile:1

FROM node:latest as base
ARG buildno
ARG gitcommithash

# USER abby

RUN apt-get update && \
  apt-get install vim curl less ripgrep -y

FROM base as integration

WORKDIR /code
# RUN pip install md2notion notion notion-tqdm
#RUN echo "Build number: $buildno"
#RUN echo "Based on commit: $gitcommithash"

