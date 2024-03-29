// a class for our round physics objects
circleActor = gamvas.Actor.extend({
        create: function(name, x, y) {
            this._super(name, x, y);
            var st = gamvas.state.getCurrentState();
            this.setFile(st.resource.getImage('circle.png'));
            // set physics proberties... before...
            this.restitution = 0.4;
            // ... creating the actual physics collision object
            this.bodyCircle(this.position.x, this.position.y, 16);
        }
});

// a class for our polygon objects
triangleActor = gamvas.Actor.extend({
        create: function(name, x, y) {
            this._super(name, x, y);
            var st = gamvas.state.getCurrentState();
            this.setFile(st.resource.getImage('smalltri.png'));
            this.restitution = 0.3;
            // add the physics collision body, set coordinates
            // of the polygon clockwise in pixel positions
            this.bodyPolygon(this.position.x, this.position.y, [ [16,0], [32,32], [0,32] ], 16, 16);
            // add a random rotation
            this.setRotation(Math.random()*2*Math.PI);
        }
});

// create our collision objects
wallActor = gamvas.Actor.extend({
        create: function(name, x, y, w, h) {
            this._super(name, x, y);
            var st = gamvas.state.getCurrentState();
            // check if we are a horizontal box or a vertical
            if (w>h) {
                this.setFile(st.resource.getImage('horizontal.png'));
            } else {
                this.setFile(st.resource.getImage('vertical.png'));
            }
            // create a static (non moving) rectangle
            this.bodyRect(this.position.x, this.position.y, w, h, gamvas.physics.STATIC);
        }
});

secondPhysicsState = gamvas.State.extend({
        init: function() {
            gamvas.physics.pixelsPerMeter = 128;
            // disable object sleeping (third parameter is false)
            var w = gamvas.physics.resetWorld(0, 9.8, false);
            this.counter = 0;
            this.addObjects = [];

            // create a few dynamic circles so something happens
            this.addActor(new circleActor('test', 0, 0));
            this.addActor(new circleActor('test2', 6, -32));
            this.addActor(new circleActor('test3', -16, -40));

            // create the walls
            this.addActor(new wallActor('ground', 0, 230, 640, 20));
            this.addActor(new wallActor('leftWall', -310, 0, 20, 480));
            this.addActor(new wallActor('rightWall', 310, 0, 20, 480));
            this.addActor(new wallActor('top', 0, -230, 640, 20));
        },

        enter: function() {
            // set how many pixels are considered 1m, this is a very
            // important setting on how realistic the sim looks
            // try to orient it on your objects and how long they
            // would be in real life
            gamvas.physics.pixelsPerMeter = 128;
        },

        draw: function(t) {
            // move/rotate the camera
            if (gamvas.key.isPressed(gamvas.key.LEFT)) {
                this.camera.rotate(-0.7*Math.PI*t);
            }
            if (gamvas.key.isPressed(gamvas.key.RIGHT)) {
                this.camera.rotate(0.7*Math.PI*t);
            }
            if (gamvas.key.isPressed(gamvas.key.UP)) {
                if (this.camera.zoomFactor < 1.5) {
                    this.camera.zoom(0.7*t);
                }
            }
            if (gamvas.key.isPressed(gamvas.key.DOWN)) {
                if (this.camera.zoomFactor > 0.1) {
                    this.camera.zoom(-0.7*t);
                }
            }
            var r = this.camera.rotation;

            // get a vector (note: we use positive 9.8 as our gravity
            // as our y coordinate runs down the screen)
            var vec = new gamvas.Vector2D(0, 9.8);

            // rotate this vector around the negative rotation
            // of the camera and set it as new gravity vector
            // this way our camera will be 'the world' and objects
            // will alwas fall down along the cameras y axis
            gamvas.physics.setGravity(vec.rotate(-r));

            // you should always add physics object in your draw
            // function and not in your event functions, as events
            // can take place all the time and it could lead to
            // flickering and other problems adding objects in
            // event handlers
            while (this.addObjects.length > 0) {
                // get the current and remove it from the array
                var curr = this.addObjects.shift();

                // randomize object type
                //
                // note for object creation:
                //
                // all actors need a unique name, so we use a counter
                //
                // also note that events can take place at any time
                // for the simplicity of the tutorial we create our
                // objects here, in real life you should add your 
                if (Math.random() < 0.5) {
                    // spawn new polygon object
                    this.addActor(new triangleActor('mousegenerated'+this.counter, curr.x, curr.y));
                } else {
                    // spawn new circular object
                    this.addActor(new circleActor('mousegenerated'+this.counter, curr.x, curr.y));
                }
                this.counter++;
            }
				// gamvas.physics.drawDebug();
        },

        onKeyUp: function(keyCode, character) {
            if (keyCode == gamvas.key.SPACE) {
                gamvas.state.setState('testState');
            }
        },

        onMouseDown: function(b, x, y) {
            // do we have a left mouse button press?
            if (b == gamvas.mouse.LEFT) {
                // have we reached the limit of dynamic objects?
                if (this.counter < 50) {
                    // convert the screen mouse position to world position
                    var worldMouse = this.camera.toWorld(x, y);
                    // are we in our box?
                    if ( (worldMouse.x < 300) && (worldMouse.x > -300) && (worldMouse.y < 220) && (worldMouse.y > -220)) {
                        // save that we have to add our object (read draw comments
                        // to know why)
                        this.addObjects.push(new gamvas.Vector2D(worldMouse.x, worldMouse.y));
                    }
                }
            }
        }
});

/* // fire up our game
gamvas.event.addOnLoad(function() {
    gamvas.state.addState(new mainState('mainState'));
    gamvas.start('gameCanvas', true);
}); */
