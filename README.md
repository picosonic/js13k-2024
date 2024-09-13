# js13k-2024
JS13KGames entry for 2024, theme is "**Triskaidekaphobia**".

## Rollermaze

![Rollermaze](big_screenshot.png?raw=true "Rollermaze")

You play as a **cuboctahedron** on the run. You have only **13 seconds** to get from the drop point to the safety of the woods before you're caught.

Some paths are blocked and will need to be opened up using the _nearest button_.

For longer distances you'll need to find a _safe spot_ which will reset the timer.

Be careful of the **grey sentinel cubes**, if you touch them they become active and will send you back to your drop point, then chase you.

Controls are :

* *Keyboard* - Movement ... **Cursors** / **WASD** (or equivalently positioned keys, **ZQSD** etc) / **ZX;.**
* *Mouse* - Movement ... **Click** then drag in a cardinal direction to roll that way.
* *Touchscreen* - Movement ... **Touch** then drag to roll that way.

# 13th edition of JS13k
To celebrate the 13th edition of js13k games competition I decided to try to use as many assets and pieces of code from my previous few entries.

* [2018 Planet Figadore Has Gone Offline](https://js13kgames.com/entries/planet-figadore-has-gone-offline) Tiled to JSON converter, Google Closure Pipeline and Build Process, 8-bit Tiny Font, Timeline Library, Input Processor, Pythagoras Calculator, RAF Callbacks
* [2019 Backspace Return To Planet Figadore](https://js13kgames.com/entries/backspace-return-to-planet-figadore) Chipcube and Tree 3D models, 3D Navigation Code, 3D maths
* [2020 Coding Golf Broken Links](https://js13kgames.com/entries/coding-golf-broken-links) Cuboctahedron 3D model, Music Player
* [2021 Airspace Alpha Zulu](https://js13kgames.com/entries/airspace-alpha-zulu) Stealth Fighter Jet 3D model
* [2021 Crater Space](https://js13kgames.com/entries/crater-space) Mobile Phone Code Portions, Confetti Particle System
* [2022 Bee Kind](https://js13kgames.com/entries/bee-kind) NPC Code, Animation Code
* [2023 Princess Of Corinium](https://js13kgames.com/entries/princess-of-corinium) Touchscreen Code

# Stuff I managed to add
* WebGL renderer based on [MicroW by Xem](https://github.com/xem/microW)
* Kind-of 3D platformer, with rolling to navigate
* 16x9 viewport which sizes appropriately to the browser size
* 8-bit tiny font (Repton inspired)
* 3D animations
* 3D particle system
* 13 seconds per level - giving the fear of 13 element
* Procedural 3D model generator for the checkerboard, converting 2D level map to 3D
* Flat shaded look ([Virtua Racing](https://en.wikipedia.org/wiki/Virtua_Racing) inspired)
* Updates to my timeline library to include associated objects and multiple callbacks
* 3D object merging
* Intuitive touchscreen controls, drag or swipe in a cardinal direction to roll that way

# Tools used
* [Ubuntu OS](https://www.ubuntu.com/)
* [vim](https://github.com/vim) text editor (also [gedit](https://github.com/GNOME/gedit) a bit)
* [Visual Studio Code](https://code.visualstudio.com/)
* [meld](https://github.com/GNOME/meld) visual diff/merge
* [GNOME Calculator](https://apps.gnome.org/Calculator/) for general mathematical calculations
* [YUI Compressor](https://github.com/yui/yuicompressor) JS/CSS compressor
* [Google closure compiler](https://developers.google.com/closure/compiler/docs/gettingstarted_app) JS minifier
* [advzip](https://github.com/amadvance/advancecomp) (uses [7-Zip](https://sourceforge.net/projects/sevenzip/files/7-Zip/) deflate to compress further)

# Play online now
[Click here to play now](https://picosonic.github.io/js13k-2024/)

# Attribution of assets
Martin Johston-Banks designed the thumbnail and cover images.

I had help designing some levels and play testing from Ethan and Amelie.

_Using part of The Trout Quintet (D.667) by Franz Schubert (in the public domain since it was composed in 1819 - before 1924)_
