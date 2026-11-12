#!/usr/bin/env bash
# Pull the latest Ardia, re-apply my tweaks (branch my-tweaks), build, and install to ~/Applications.
set -euo pipefail
root="$(cd "$(dirname "$0")" && pwd)"
cd "$root"

if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "You have uncommitted changes. Commit them to my-tweaks first." >&2
  exit 1
fi

echo "==> Getting the latest Ardia"
git checkout -q my-tweaks
git fetch -q origin main
if ! git merge --no-edit origin/main; then
  echo >&2
  echo "Ardia changed the same lines as one of your tweaks. Fix the files git lists above," >&2
  echo "then run: git add -A && git commit --no-edit && ./update-my-ardia.sh" >&2
  exit 1
fi

echo "==> Installing dependencies"
npx -y pnpm@11 install
(cd apps/browser/macos && pod install)
packages/ardiacore/scripts/ubo.sh
packages/ardiacore/scripts/ubol.sh

echo "==> Building (Release)"
cd apps/browser
xcodebuild -workspace macos/Ardia.xcworkspace -scheme Ardia-macOS -configuration Release \
  -destination 'platform=macOS,arch=arm64' -derivedDataPath build \
  -xcconfig macos/AdHoc.xcconfig -quiet

echo "==> Installing to ~/Applications/Ardia.app"
mkdir -p "$HOME/Applications"
rm -rf "$HOME/Applications/Ardia.app"
cp -R build/Build/Products/Release/Ardia.app "$HOME/Applications/Ardia.app"
echo "Done. Quit Ardia and reopen ~/Applications/Ardia.app"
