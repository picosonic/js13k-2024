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
Looking into the [Triskaidekaphobia on Wikipedia](https://en.wikipedia.org/wiki/Triskaidekaphobia), and having ideas about possible games. I've got several ideas for different types of games I'd like to make, but mindful of picking one which matches the theme.

Padded out build environment and workflow.

![Intial sketches](aug16.png?raw=true "Initial sketches")

Did some tests with [xem's MicroW](https://xem.github.io/microW/) WebGL 3D engine.

![WebGL first render](webgl.jpg?raw=true "WebGL first render")

14th August
-----------
Had some issues commiting to GitHub, seems they were having issues.

WebGL caused me some pain whilst debugging on FireFox, so switched to Google Chrome. The single-stepping through breakpoints would sometimes make the whole browser crash, which wasn't ideal.

Added camera movement from keyboard.

Added more models to the scene, to look around. Starting off with 3 cubes of varying colours. I think I'll stick with flat shaded models as I don't want to go down the route of uvs and textures just yet!

Tried procedural generation for chequerboard, ran into colour issue, where colour is applied to whole model, not per triangle. It later turned out that there was a couple of issues, firstly when doing flat shaded models you can't use any vertices which are used by a face in more than one colour, secondly I forgot that I had the optional override which made the whole model the same colour.

Reading through some more [WebGL docs](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial).

Google closure is quite vocal about the use of variables without declaring them first, so made some updates to fix this.

Added the timeline library I'd made for previous JS13k entries so handle animations and other game changes.

15th August
-----------
Moved inputs handling code to separate file, just to make the main code cleaner.

Refactored input code using event.which to event.code, as "which" has been deprecated.

16th August
-----------
Make use of timelines to test animation. Decided to add associated object to timeline callback, this should make it easier to apply changes.

Made a cube roll around the grid when directed by user input. This was quite tricky until I realised that when the model is rotated in multiple axes, the rotation changes direction. So when rotate right, a rotate forward actually goes right due to the rotation. Fixed it by cheating, because the model has full symmetry I'm able to reset the rotation when at target position, this means the next move always goes the way I expect it to go.

Made camera movement only linked to user input when in debug mode - press I to toggle.

![Movement tests](aug17.gif?raw=true "Movement tests")

17th August
-----------
Been staring at the WebGL code a lot and not really knowing what some parts meant. So have made small changes, refactored and added tons more comments based on a nice step-by-step [WebGL tutorial](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial).

The WebGL tutorial I found suggests that steps can be split out into init and a render parts. So you don't need to do all the setup for each frame that's rendered. So I split some of the WebGL code out into these two parts. Might have a slight performance improvement.

Decided to refactor WebGL code to be closer to what I've done before in terms of 3D models, so added an "OpenGL default palette" for per-face colouring, convert vertices/faces notation into pure vertices. Also refactored the built in "cube" model, and my chequerboard function.

This refactoring is also with a view towards switching from gl.drawArrays to gl.drawElements which is meant to be [more efficient](https://community.khronos.org/t/gldrawelements-vs-gldrawarrays/33306).

![Stealth model](aug18.gif?raw=true "Stealth model")

18th August
-----------
Noticed some odd behaviour with the 3D model rendering, namely the chequerboard had a cube underneath it, and when I tried adding new models they always rendered as a cube unless I had placed them as the first object to render. The issue turned out to be that I was only clearing the vertex buffer once per frame instead of per-object.

Also noticed that rendering was different between Firefox and Chrome, and the minified version also looked different. This seemed to be an issue with uv texture mapping, so decided for now that I won't use this and removed all the uv and texture code, because after all I only want to do flat shaded models.

The way objects were associated with models seemed to break when minified, so I changed it to run the function to generate the model rather than store the name for the function as a string.

Added a custom loader which can import 3D models in a JSON format that I've used in previous JS13k entries. The main difference is that the faces reference vertices which are 0 based.

19th August
-----------
Added 3D fps style movement to the camera when in debug mode. This is to allow me to look around and zoom in/out of models to see how they look from various angles.

![FPS navigation](aug19.gif?raw=true "FPS navigation")

20th August
-----------
Added capability for multiple callbacks and object associations to be added to timelines. This allows me to run a function against an object but on a timeline so they are in sync, for example rotating more than one object.

23rd August
-----------
Allow scale to be single number or array when adding models to scene, as a lot of the time, the scale in X, Y and Z will be the same. I suppose if you were to use a cube model, but stretch it in various ways you can make other shapes simply, but for my purpose the models will often only be scaled as a whole. So this change gave me the flexibility to do either.

Added more 3D models for testing, stealth fighter - from my [JS13k entry in 2021](https://js13kgames.com/entries/airspace-alpha-zulu), chipcube and tree - from my [JS13k entry in 2019](https://js13kgames.com/entries/backspace-return-to-planet-figadore).

Increase movement speed in debug mode by a factor of 2, since it can be quite slow to navigate around.

Fixed checkerboard and built-in cube face colours array length, each square has 2 triangular faces. So need twice as many entries added to the colours array, one for each triangle that makes up a square.

Increased model rotation speed by a factor of 2, again it was just a bit slow.

Process per-face colours when set in model object, but can be replaced by a whole-object colour. This was a new area for me doing shader GL code, and it's still a bit of a dark-art. Very easy to break it if you don't know what you're doing, or don't know what IN variables you can use and what for, and what OUT variables you should export.

![Per face colouring](aug24.gif?raw=true "Per face colouring")

24th August
-----------
Fix checkerboard routine after realising the colours were being overridden to grey and fixed the colours would produce strips when an even numbered grid axis lengths, used an origin point to make model centered on 0,0 (to make rotation easier) and fixed vertex positions.

Add mouse/touch input control, where pressing and swiping in one of 4 directions should be equivalent to the cursor control. Although as I later found through testing, it's very annoying to have to swipe 10 times to move 10 squares, much easier to have it auto repeat while the "virtual" direction is being selected.

Added five basic levels to start off some gameplay testing, which may end up being the tutorial levels. These were built in Tiled based on the sketches I did early on in the project. These go through the build pipeline to turn them into JSON and include them in the project.

Changed the background from grey to a blue colour, to give it a bit of a [skybox](https://en.wikipedia.org/wiki/Skybox_(video_games)) feel.

![Testing models](aug25th.png?raw=true "Testing models")

28th August
-----------
Fixed issue with mouse/touch control when just clicking with a deadzone area so that a minimum of 10% (of the screen width or height) movement in either X or Y is required before registering as a swipe. Otherwise it was just too over sensitive.

Removed test models so that I can load in test levels. These levels are converted from 2D into 3D by building models on-the-fly and adding them to the scene, converting X,Y into X,Z (as Y is up axis). All level tiles are loaded as checkerboard, but some have colour overrides to aid debug.

Make a note of which model in the scene is the player model, so that it can be manipulated - rather than always assuming it's model #1. Also note position in 2D level array so that restrictions can be made to stop it going off the edge e.t.c. and items interacted with based on collisions.

Sped up rotation when moving, and determined that translation should be about 1/45th of the rotation to make it appear natural rotation.

Allow checkerboards to be created of any size.

![Testing levels](aug29th.png?raw=true "Testing levels")

29th August
-----------
Constrain movements to level squares by tracking the 3D model in the 2D representation of the game world and checking for edges and blocked tiles.

Updated movement to allow inputs in multiple axes at once so the first available route is taken. This means you no longer need to move up to a boundary, then stop to change axis. So pressing or swiping to up/left would keep doing along the axis until hitting a blocked path then trying the other axis. Which means it's now much easier to go along zigzag paths too.

![Testing level rolling](aug30.gif?raw=true "Testing level rolling")

3rd September
-------------
Added 2D pixel font rendering system to be used for an OSD. I want to show a countdown clock and other things like hints and level changing messages e.t.c.

Added countdown timer, so each "action" needs to be completed within the timelimit of 13 seconds - fear of the number 13.

4th September
-------------
Added music based on Franz Schubert, The Trout. This uses a music player which I developed for previous JS13k competitions and was inspired by Xem's [miniMusic](https://github.com/xem/miniMusic).

7th September
-------------
Levels are now completable - i.e. you start at the start square and move to the end square to progress.

Improved timer to show 13s briefly before counting down. This is just a case of using round rather than floor, so not really the right way to do it.

Made copies of 2D levels so they can be altered on-the-fly without damaging level data JSON for further runs of the same level. Really the only changes will be the state of the blocked tiles to know if they are unblocked.

Added edges to the level tiles to make them look more solid. Previously they were flat squares like picnic blankets, so giving them an edge makes them look more like tiles and give them a more 3D feel.

Highlight "button" tile, by making it pink. This was initially just for debug but I liked it so kept it in the game.

8th September
--------------
Silence the "rests" in the music. Previously I used note "0" to mean silence in the music data, but this was playing out as a very low note which was audible.

Add state machine to navigate through game states, going from attract -> menu -> inplay -> endlevel -> endgame. Although as it turned out later, I didn't feel the game needed an attract or menu state.

Added level offset 3D values such that level will be centered on 0,0,0. This is for rotation purposes, as otherwise the models would need to be translated to 0,0,0 rotated and translated back. Just makes it slightly easier on the maths.

Playing about with rotating level depending on player position, so it feels like a ball in a maze. I was thinking the game was starting to feel a bit like [Super Monkey Ball](https://en.wikipedia.org/wiki/Super_Monkey_Ball) which I used to enjoy playing on my [Nintendo Gamecube](https://en.wikipedia.org/wiki/GameCube), but ultimately it felt a bit nauseating - so took it out.

Added code to handle block and button tiles. So a block tile remains blocked until a button opens it up. This included lowering the blocked tile so that it was obviously a different height to the rest of the level, then raising it and making it checkerboard when it was unblocked. Initially I made it so that any button tile would unblock all of the blocked tiles, but later changed this to only unblock the nearest one.

9th September
-------------
Added game to the js13k WIP submission page. As there is a new way of submitting this year, where you can reserve a name (slug) for the game and see what it looks like when it will be live. This is useful as previously the game has played differently when minified or when served from an https site.

Added 3D particle system using mini chip-cubes. This looks quite nice, but I'm just firing them out in random directions until they fade out and not applying gravity (like I have done in previous particle systems).

Made level 3 more complicated, 7x5 compared to a 3x3 test level, to see what it was like to play.

Made the camera follow the player with a slight lag.

![Camera following player](aug25th.png?raw=true "Camera following player")

10th September
--------------
Improved mouse/touch controls. Now acts a bit like a virtual joystick centered on the initial press. This means long movements and diagonal movements are possible when either or both axes are outside of the deadzone.

Changed button logic to only unblock the closest blocker tile. Which allows for more complex levels.

11th September
--------------
Moving into final few days, decided to have a day off from work for the final push! I should do this every year :)

Added trees to decorate the end of level tile. Initally I wondered about have an arch showing where the exit was, and have it generated by using "[Solids of Revolution](https://en.wikipedia.org/wiki/Solid_of_revolution)" method (seen in Beebug magazine Vol.8 No.7 December 1989). But ultimately I decided that using something hollistic and from nature made for a better destination.

Limit total number of particles as I found that when unrestrained and generating a lot it could draw the browser to a halt and consume a lot of CPU and RAM.

Start timer when player first moves. Stop timer when it runs out or the current level is completed. This gives the player a chance to have a break between levels without needing a menu screen and also allows them to have a quick peek at what lies ahead of them.

Transition to end of game state when all levels completed. Previously I was allowing th levels to loop back to the first one, so that I could have continuous gameplay when there was only a small number of short levels.

Added end of level animation, which at first I wanted to to spin the camera from above pointing down at the player, but ultimately a bounce rotate effect felt more like a party celebration, which when combined with the particles of confetti made more sense.

OSD text as to what's going on, for example if you've failed a level, completed a level, pre-level prompt (which is different on first level) and a game completion message.

Added failure state when you don't get to the forest within 13 seconds. Some of the bigger levels can easily lead to failure if you don't have a strategy or go the "right" way.

Reset timer when rolling onto timer tile, as some of the bigger levels you just can't get around in 13 seconds. So the timer is an invisible tile which reset the tiles when rolled over.

Fall "into" each level from above, to give the feeling of being dropped into a challenge.

Reset inputs when starting each level, and if mouse goes outside window in desktop mode. Otherwise when mouse goes back into play, the inputs can be skewed and the player can end up in a place they can't move from!

Don't put up OSD until we're on the ground, so that it looks like the challenge isn't starting until you are ready - as you can't roll in midair.

Put player in the middle of the forest and animate them on completion. No matter which direction they enter the forest from, so that the end animation looks better.

Added NPC character tile, with collision detection that sends the player back to the start point. This was added to make the levels harder and more fun, and also to add an NPC element for the OP Guild decentralized challenge.

Fixed an issue when time runs out and you're mid-move. This was because the player had a target translation and target rotation which hadn't been satisfied yet, so the player could end up in the middle of nowhere. Fixed by resetting player movement target to null.

Added some story line and controls to the info page.

Added animating stealth plane.

12th September
--------------
Made NPC deadly once you've touched them. They move towards the player once they are activated, they also change colour when active and the background becomes darker.

Added thumbnail and cover image courtesy of Martin Johnston-Banks.

Added info to README detailing some of the code and assets I've re-used from my previous JS13k entries.

Added more levels as we're only at about 60% of 13k !

Allow more than one sentinel, to give more jeopardy and made them move faster.

Added some levels made by Ethan and Amelie, then brought the total number of levels up to 25.

Added music unlock, for when the browser doesn't think the audio context was created by a user action??!?

Still only 8.6k - hmmmm :)


In summary
----------
I really enjoyed taking part in the competition again this year, and the massive challenge that learning a new web technology in a short timeframe brings with it. WebGL is something I've wanted to try for a while, and foolishly I thought there was enough tutorials, sample code and other online help I could get with it. But didn't realise just how steep the learning curve would be nor that the debug would be quite a bit harder as I can't really stop things mid-draw.

I feel like I've come up with a fairly good game which is fun to play. I do love doing 3D stuff, but it's more than half-as-much extra work compared to a 2D game.
