Instruction&Pitfalls

[uk/20180212]
Install:
$ npm install
$ bower install

Add cordova platform:
$ cordova platform add android@6.4.0
$ cordova platform add ios@4.5.4

Develop local (Gruntfile_rhb.js, Gruntfile_itweet.js / add CORS to chrome an switch on):
Grunt Run: run-on-local-server_dev_ch.wbss.rhb.dev

Load to android app:
Grunt Run: run-android-dev

[uk/20180212] Quirks:
- iOS compiles with 3 error. Ignore.
Gotto ./platform/ios/QUALIDEV.xcodeproj and start project in XCode to deploy on iOS device.
If you get an error unckeck devicee orientation and check again!
If you can opne camera or add images for album. edit xxx-info.plist file:
Add privacy for camera/album

-generell
app_min.js does not work


[uk 20160516]
Create src doc:
1. run grunt task (Gruntfile_project): copy_temp_doc_itweet or copy_temp_doc_rhb
2. run doc creator:
$ typedoc --out ./doc/rhb ./temp/**/*.ts --name 'QS-Mobile App' --verbose --target ES5 --module amd --excludeExternals
or
$ typedoc --out ./doc/itweet ./temp/**/*.ts --name 'itweet App' --verbose --target ES5 --module amd --excludeExternals