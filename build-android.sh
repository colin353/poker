#!/bin/bash

react-native bundle --entry-file index.android.js --bundle-output  android/app/src/main/assets/index.android.bundle --root src
cd android
./gradlew assembleRelease
cd android/app/build/outputs/apk
pwd
ls
echo build done. now run adb install *.apk
