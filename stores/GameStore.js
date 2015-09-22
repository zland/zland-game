/*!
 * Copyright 2015 Florian Biewald
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var ChangeEventEmitter = require('core/ChangeEventEmitter');
var assign = require('object-assign');
var Dispatcher = require('core/Dispatcher');

var ZombieConstants = require('zombie/Constants');
var CoreConstants = require('core/Constants');
var MapConstants = require('map/Constants');
var SpotStore = require('generatorSpot/stores/SpotStore');
var PlayerStore = require('player/stores/PlayerStore');

var _hasZombieBittenPlayer = false;

function aZombieBitesPlayer() {
  var spots = SpotStore.getRevealedSpotsByName('zombie');
  var isPlayerBitten = false;
  spots.forEach(function(spot) {
    if (spot.get('dead')) {
      return;
    }
    if (zombieBitesPlayer(SpotStore.getSpotElementById(spot.get('id')), PlayerStore.getPlayerElement())) {
      isPlayerBitten = true;
      return false;
    }
  });
  return isPlayerBitten;
}

function zombieBitesPlayer($zombie, $player) {
  var i, len, pPos, point, points, zPos;
  zPos = $zombie.get(0).getBoundingClientRect();
  pPos = $player.get(0).getBoundingClientRect();
  points = [
    {
      x: zPos.left,
      y: zPos.top
    }, {
      x: zPos.left + zPos.width,
      y: zPos.top
    }, {
      x: zPos.left,
      y: zPos.top + zPos.height
    }, {
      x: zPos.left + zPos.width,
      y: zPos.top + zPos.height
    }
  ];
  for (i = 0, len = points.length; i < len; i++) {
    point = points[i];
    if (point.x > pPos.left && point.x < pPos.left + pPos.width && point.y > pPos.top && point.y < pPos.top + pPos.height) {
      return true;
    }
  }
  return false;
}


var GameStore = assign({}, ChangeEventEmitter, {
  hasZombieBittenPlayer: function() {
    return _hasZombieBittenPlayer;
  },

  isNewPlayer: function() {
    return window.localStorage.getItem('isNewPlayer') === null ? true : false;
  }
});

GameStore.dispatchToken = Dispatcher.register(function(action) {

  switch (action.type) {

    case CoreConstants.CORE_CONTINUE:
      _hasZombieBittenPlayer = false;
      GameStore.emitChange();
      break;

    case CoreConstants.CORE_INTRODUCTION_DONE:
      window.localStorage.setItem('isNewPlayer', false);
      GameStore.emitChange();
      break;

    case ZombieConstants.ZOMBIE_POSITION:
      if (_hasZombieBittenPlayer) return;
      if (PlayerStore.getPlayer().get('dead') === false && aZombieBitesPlayer()) {
        _hasZombieBittenPlayer = true;
        GameStore.emitChange();
      }
      break;

    case MapConstants.MAP_CENTER:
      if (_hasZombieBittenPlayer) return;
      if (PlayerStore.getPlayer().get('dead') === false && aZombieBitesPlayer()) {
        _hasZombieBittenPlayer = true;
        GameStore.emitChange();
      }
      break;
  }
});

module.exports = GameStore;
