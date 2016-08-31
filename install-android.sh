#!/bin/bash

cd android/app/build/outputs/apk
adb uninstall com.poker_app
adb install app-release.apk
