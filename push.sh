#!/usr/bin/env bash

set -e

# Build, tag, and push container image to quay.io/coreos/tectonic-console
# Will push a sha-named image at every run.
# If it appears to be the tip of master, will tag that image with a
# git tag if one is present.
# If IMAGE_TAG is set, will use IMAGE_TAG as the tag instead.

# This script relies on .dockercfg or other external configuration to
# grant the appropriate permissions and identity for pushing images quay.io

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
pushd $SCRIPT_DIR

set -x
: ${REPO:=quay.io/rawagner/kubevirt-web-ui}
#: ${REPO:=quay.io/coreos/tectonic-console}
#: ${TESTER_REPO:=quay.io/coreos/tectonic-console-tester}

GIT_VERSION=$(./git-version.sh)

if [[ "$GIT_VERSION" == *dirty ]]; then
    echo "Won't push from a dirty git repo. Commit your changes before you push."
    echo "Changes:"
    git diff
    exit 1
fi

if [ -n "$IMAGE_TAG" ]; then
  echo "IMAGE_TAG detected, using instead of the git version."
  GIT_VERSION="$IMAGE_TAG"
fi

podman build -q --rm=true -f Dockerfile -t $REPO:$GIT_VERSION .
podman push $REPO:$GIT_VERSION

if [ -n "$IMAGE_TAG" ]; then
  IMAGE_TAG_NO_DASH=`echo $IMAGE_TAG | sed 's/\(.*\)-.*$/\1/g'`  # v1.3.0-3 to v1.3.0
  IMAGE_TAG_MAJOR_MINOR_ONLY=`echo $IMAGE_TAG | sed 's/\([a-zA-Z]*[0-9]\)\.\([0-9]\).*$/\1\.\2/g'` # v1.3.0-3 to v1.3
  podman tag $REPO:$GIT_VERSION $REPO:latest
  podman tag $REPO:$GIT_VERSION $REPO:$IMAGE_TAG_NO_DASH
  podman tag $REPO:$GIT_VERSION $REPO:$IMAGE_TAG_MAJOR_MINOR_ONLY
  podman push $REPO:latest
  podman push $REPO:$IMAGE_TAG_NO_DASH
  podman push $REPO:$IMAGE_TAG_MAJOR_MINOR_ONLY
fi

# Not used by kubevirt:
#TAG=$(git describe --exact-match --abbrev=0 --tags ${COMMIT} 2> /dev/null || true)
#if [ -n "$TAG" ]; then
#  echo "Release tag is $TAG. Uploading test image to quay."
#  docker build -q --rm=true -f e2e.Dockerfile -t $TESTER_REPO:$GIT_VERSION .
#  docker push $TESTER_REPO:$GIT_VERSION
#fi

popd
