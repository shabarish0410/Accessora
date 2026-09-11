const fs = require('fs');
const path = require('path');

const targetFile = path.join(
  __dirname,
  '..',
  'node_modules',
  '@react-native',
  'gradle-plugin',
  'settings-plugin',
  'src',
  'main',
  'kotlin',
  'com',
  'facebook',
  'react',
  'ReactSettingsExtension.kt'
);

if (!fs.existsSync(targetFile)) {
  console.log('[postinstall] ReactSettingsExtension.kt not found, skipping patch.');
  process.exit(0);
}

let content = fs.readFileSync(targetFile, 'utf8');

const targetStr = `  @JvmOverloads
  public fun autolinkLibrariesFromCommand(
      command: List<String> = defaultConfigCommand,
      workingDirectory: File? = settings.layout.rootDirectory.dir("../").asFile,
      lockFiles: FileCollection =
          settings.layout.rootDirectory
              .dir("../")
              .files("yarn.lock", "package-lock.json", "package.json", "react-native.config.js"),
  ) {`;

const replacementStr = `  private val defaultWorkingDirectory: File?
    get() = settings.layout.rootDirectory.dir("../").asFile

  private val defaultLockFiles: FileCollection
    get() =
        settings.layout.rootDirectory
            .dir("../")
            .files("yarn.lock", "package-lock.json", "package.json", "react-native.config.js")

  @JvmOverloads
  public fun autolinkLibrariesFromCommand(
      command: List<String> = defaultConfigCommand,
      workingDirectory: File? = defaultWorkingDirectory,
      lockFiles: FileCollection = defaultLockFiles,
  ) {`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(targetFile, content, 'utf8');
  console.log('[postinstall] Patched ReactSettingsExtension.kt to fix Kotlin K2 compiler crash.');
} else {
  console.log('[postinstall] ReactSettingsExtension.kt is already patched or does not match target string.');
}
