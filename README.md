<h1>Speech Transcribe</h1>

<br>

<p>
  Speech Transcribe is a software used to transcribe speech to text. This is an open source alternative to SuperWhisper but for Linux. Speech Transcribe uses <a href="https://electron.atom.io/">Electron</a>, <a href="https://facebook.github.io/react/">React</a>, <a href="https://github.com/reactjs/react-router">React Router</a>, <a href="https://webpack.js.org/">Webpack</a> and <a href="https://www.npmjs.com/package/react-refresh">React Fast Refresh</a>.
</p>

<br>

<div align="center">

[![Build Status][github-actions-status]][github-actions-url]
[![Github Tag][github-tag-image]][github-tag-url]

</div>

## Install

Clone the repo and install dependencies:

```bash
git clone --depth 1 --branch main https://github.com/arunachalam-b/speech-transcribe.git
cd speech-transcribe
npm install
```

**Having issues installing? See our [debugging guide](https://github.com/electron-react-boilerplate/electron-react-boilerplate/issues/400)**

## Starting Development

Start the app in the `dev` environment:

```bash
npm start
```

## Packaging for Production

To package apps for the local platform:

```bash
npm run package
```

## Some common issues

#### Access denied error thrown by `ffmpeg` while converting from `audio_in.wav` to `audio_out.wav`
This primarily happens because the `ffmpeg` package would have been installed via Snap instead of `apt`. Snap usually sandbox packages. 
This makes ffmpeg not able to access contents from hidden or user profile folders. To solve this, remove the snap installation using
`sudo snap remove ffmpeg` and install using `apt`. Run the below commands to install via `apt`
```
sudo add-apt-repository ppa:savoury1/ffmpeg4
sudo apt-get update
sudo apt-get install ffmpeg
```

#### Segmentation fault
This usually happens on newer Linux machines due to the Ubuntu's recent shift to Wayland protocol instead of x11. In such case, you need to
clone the whisper.cpp repo, compile, and generate the whisper-cli binary file in the system that uses Wayland. 

## Maintainers

- [Arunachalam](https://github.com/arunachalam-b)

## License

MIT © [Speech Transcribe](https://github.com/arunachalam-b/speech-transcribe)

[github-actions-status]: https://github.com/arunachalam-b/speech-transcribe/workflows/Test/badge.svg
[github-actions-url]: https://github.com/arunachalam-b/speech-transcribe/actions
[github-tag-url]: https://github.com/arunachalam-b/speech-transcribe/releases/latest
[github-tag-image]: https://img.shields.io/github/tag/arunachalam-b/speech-transcribe.svg?label=version
