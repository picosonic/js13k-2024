# Dev Diary / Postmortem

This is my eigth game jam entry.

Like in all my previous years entering the competition, just before the theme was announced I created a new project template with updated build and minify steps from my entry last year.

As soon as the theme was announced I had some thoughts as to what kind of game I wanted to create to fit the theme, here as some of my initial thoughts/notes/ideas ..

Triskaidekaphobia
-----------------
* Fear or avoidance of the number 13
* Superstitions, like Friday 13th
* Card number 13 in tarot being "death"
* Unlucky
* Apollo 13, launched at 13:13 with the tank explosion on April 13th

Game ideas
----------
* 13 things to do
* 13 levels of the game
* Given it's a phobia, some kind of hazard or danger element
* Dice forming part of the mechanic with face pips as counters
* I want to try a 3D game again, but this time with WebGL

Here is a rough diary of progress as posted on [Twitter](https://twitter.com/femtosonic), taken from notes and [commit logs](https://github.com/picosonic/js13k-2024/commits/)..

13th August
-----------
Looking into the [Triskaidekaphobia on Wikipedia](https://en.wikipedia.org/wiki/Triskaidekaphobia), and having ideas about possible games.

Padded out build environment and workflow.

Did some tests with [xem's MicroW](https://xem.github.io/microW/) 3D engine.

14th August
-----------
Had some issues commiting to GitHub, seems they were having issues.

WebGL caused me some pain whilst debugging on FireFox, so switched to Google Chrome.

Added camera movement from keyboard.

Added more models to the scene, to look around.

Tried procedural generation for chequerboard, ran into colour issue, where colour is applied to whole model, not per triangle.

Reading through some more WebGL docs.

15th August
-----------
Moved inputs to separate file.

Refactored input code using event.which to event.code, as which has been deprecated.

16th August
-----------
Make use of timelines to test animation. Decided to add associated object to timeline callback, this should make it easier to apply changes.

Made a cube roll around the grid when directed by user input. This was quite tricky until I realised then model is rotated in multiple axes, the rotation changes direction. Fixed it by resetting rotation when at target position.

Made camera movement only linked to user input when in debug mode - press I to toggle.

17th August
-----------
Been staring at the WebGL code a lot and not really knowing what some parts meant. So have made small changes, refactored and added tons more comments based on a nice step-by-step [WebGL tutorial](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial).

The WebGL tutorial I found suggests that steps can be split out into init and a render parts. So you don't need to do all the setup for each frame that's rendered. So I split some of the WebGL code out into these two parts. Might have a slight performance improvement.

Decided to refactor WebGL code to be closer to what I've done before in terms of 3D models, so added an "OpenGL default palette" for per-face colouring, convert vertices/faces notation into pure vertices. Also refactored the built in "cube" model, and my chequerboard function.

This refactoring is also with a view towards switching from gl.drawArrays to gl.drawElements which is meant to be more efficient.

18th August
-----------
Noticed some odd behaviour with the 3D model rendering, namely the chequerboard had a cube underneath it, and when I tried adding new models they always rendered as a cube unless I had placed them as the first object to render. The issue turned out to be that I was only clearing the vertex buffer once per frame instead of per-object.

Also noticed that rendering was different between Firefox and Chrome, and the minified version also looked different. This seemed to be an issue with uv texture mapping, so decided for now that I won't use this and removed all the uv and texture code.

The way objects were associated with models seemed to break when minified, so I changed it to run the function to generate the model rather than store the name for the function as a string.

Added a custom loader which can import 3D models in a JSON format that I've used previously.

19th August
-----------
Added 3D fps style movement to the camera when in debug mode.

20th August
-----------
Added multiple callbacks and object associations to be added to timelines.

23rd August
-----------
Allow scale to be single number or array when adding models to scene, as a lot of the time, the scale in X, Y and Z will be the same.

Added more 3D models for testing, stealth fighter - from my [JS13k entry in 2021](https://js13kgames.com/entries/airspace-alpha-zulu), chipcube and tree - from my [JS13k entry in 2019](https://js13kgames.com/entries/backspace-return-to-planet-figadore).

Increase movement speed in debug mode.

Fixed checkerboard and built-in cube face colours array length, each square has 2 triangular faces.

Increased model rotation speed.

Process per-face colours when set in model object, but can be replaced by a whole-object colour.

24th August
-----------
Fix checkerboard routine after realising the colours were being overridden to grey and fixed the colours would produce strips when an even numbered grid axis lengths, used an origin point to make model centered on 0,0 and fixed vertex positions.

Add mouse/touch input control so swiping should be equivalent to cursor control.

Added some very basic levels to start off some gameplay testing.

28th August
-----------
Fixed issue with mouse/touch control when just clicking so that a minimum of 10% movement in either X or Y is required before registering as a swipe.

Removed test models so that I can load in test levels.

Make a note of which is the player model. Also note position in 2D level array so that restrictions can be made and items collected.

Sped up rotation when moving, and determined that translation should be about 1/45th of the rotation to make it appear natural rotation.

Allow checkerboards to be created of any size.

29th August
-----------
Constrain movements to level squares.

Updated movement to allow inputs in multiple axes at once so the first available route is taken. This means you no longer need to move up to a boundary, then stop to change axis.

3rd September
-------------
Added 2D pixel font rendering system to be used for an OSD.

Added countdown timer, so each "action" needs to be completed within the timelimit of 13 seconds - fear of the number 13.

4th September
-------------
Added music based on Franz Schubert, The Trout.

7th September
-------------
Levels are now completable - i.e. you start at the start square and move to the end square to progress.

Improved timer to show 13s briefly before counting down.

Made copies of levels so they can be altered on-the-fly without damaging level data for further runs.

Added edges to the level tiles to make them look more solid.

Highlight "button" tile.
