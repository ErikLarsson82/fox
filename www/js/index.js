/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');

        var stage = new PIXI.Container();
        var renderer = PIXI.autoDetectRenderer(500, 500);
        document.body.appendChild(renderer.view);
        PIXI.Loader.shared
          .add("coffee", "img/bike.png")
          .load(setup);
        var block;

        function setup() {
          block = new PIXI.Sprite(PIXI.Loader.shared.resources.coffee.texture);  
          block.anchor.x = 0.5;
          block.anchor.y = 0.61;

          block.position.x = 200;
          block.position.y = 150;
          stage.addChild(block);
          renderer.render(stage);
          console.log("rendered", window.innerWidth, window.innerHeight);
          theloop();
        }

        var theloop = function(){
          requestAnimationFrame(theloop);
          block.rotation += .03;
          renderer.render(stage);
        };
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        /*var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
*/
        console.log('Received Event: ' + id);
    }
};

app.initialize();