<h1 align="center">
  <img src="./assets/images/logo (2).png" alt="Image-Optimizer icon" width="120">

Image-Optimizer

</h1>

<h2 align="center"> A self-hosted local image optimizer that runs in your browser.</h2>

<center>
   <img src="./assets/images/logo (2).png" alt="Image-Optimizer desktop screen capture dark mode" width="200">
</center>

## About

Image-Optimizer is a simple image optimizer that runs in your browser, works offline, and keeps your images private without ever leaving your device.

Created for everyday people and designed to be shared with family and friends, it serves as an alternative to questionable "free" online tools.

## Table of Content

- [Features](#features)
- [Install](#install)
- [Screenshots](#screenshots)
- [Attributions](#attributions)

## Features

- 🖼️ **Optimize Images in Your Browser**
  - Adjust image quality
  - Set target file size
  - Set max width/height
  - Paste images from clipboard
  - Convert between and to `JPG`, `PNG`, `WebP`
  - Convert from `HEIC`, `AVIF`, `GIF`, `SVG`
- 🔒 **Privacy-Focused**
  - Works offline
  - On-device image processing
  - Removes EXIF data (location, date, etc.)
  - No tracking
  - Installable web app ([learn more](#web-app))

**Planned**

- [x] Upload multiple files at once
- [x] Support for more image file types
  - Recently added conversion from: `HEIC`, `AVIF`, `GIF`, `SVG` → `JPG/PNG/WebP`
- [x] Remember last-used settings
- [ ] Image cropping

## Install

### Docker

1. Using [Docker Compose](https://docs.docker.com/compose/):

```
services:
  Image-Optimizer:
    container_name: Image-Optimizer
    image: ghcr.io/civilblur/Image-Optimizer:latest
    ports:
      - "3474:80"
```

2. Access the app at `http://localhost:3474`

### Local

1. Download the [latest source code release](https://github.com/civilblur/Image-Optimizer/releases).
1. Open the `index.html` file to launch the app in your browser.

### Web App

1. Visit [Image-Optimizer.com](https://Image-Optimizer.com/), or self-host for even stronger privacy.
1. Click the "Install" button in the top-right.
   - If the button isn’t available, you can still install it manually in a few simple clicks. ([See how](./docs/install-web-app.md))
1. A shortcut to Image-Optimizer will be added to your device and can even be used offline.


## Screenshots



<center>
   <img src="./assets/images/sc-light.png" alt="Image-Optimizer desktop screen capture light mode" width="600">
</center>

|                                                                                                                                  |                                                                                                                                       |
| :------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------: |
|       Dark mode<br><img src="./assets/images/sc-fs-dark.png" alt="Image-Optimizer dark mode" width="90%%">       |        Light mode<br><img src="./assets/images/sc-fs-light.png" alt="Image-Optimizer light mode" width="90%%">        |
| Settings<br><img src="./assets/images/settings-light.png" alt="Image-Optimizer settings" width="90%%"> | Download images<br><img src="./assets/images/settings-dark.png" alt="Image-Optimizer settings" width="90%%"> |

## Attributions

- [Browser Image Compression](https://github.com/Donaldcwl/browser-image-compression)
- [heic-to](https://github.com/hoppergee/heic-to), [libheif](https://github.com/strukturag/libheif), [libde265](https://github.com/strukturag/libde265)
- [JSZip](https://github.com/Stuk/jszip)

[View full list and details](./docs/ATTRIBUTIONS.md)

## License

[GNU General Public License v3.0](https://github.com/civilblur/Image-Optimizer/blob/main/README.md)
