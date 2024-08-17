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
