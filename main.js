var wd = require('wd');
var path = require('path');
var TouchAction = require('wd').TouchAction;
var MultiAction = require('wd').MultiAction;
var webviewApp = path.resolve(require.resolve('multi-touch-draw-app'), '..', require('multi-touch-draw-app')[1]);

var driver = wd.remote('localhost', 4723);
var pi = Math.PI;

var caps = {
  platformName: 'iOS',
  platformVersion: '8.4',
  deviceName: 'iPhone 6',
  app: webviewApp
}

var drawLine =function(x1, y1, x2, y2){
  var line = (new TouchAction(driver))
    .press({x:x1,y:y1})
    .moveTo({x:x2, y:y2})
    .release();
  driver.performTouchAction(line);
}

var circleAction = function() {
  var cos = Math.cos;
  var sin = Math.sin;
  var pi = Math.PI;
  var theta = 0;
  var h = 400;
  var k = 400;
  var r = 100;
  var prev = {x: h+r*cos(theta), y: k+r*sin(theta)}
  var action = new TouchAction(driver);
  action.press(prev);
  for (theta; theta < 2*pi; theta+=2*pi/36) {
    var next = {x: h+r*cos(theta), y: k+r*sin(theta)}
    var offset = {x: next.x-prev.x, y: next.y-prev.y}
    action.moveTo(offset);
    prev = next;
  }
  action.release();
  return action;
}

var h = 150;
var k = 150;
var r = 100;

var arcAction = function(start, end) {
  var cos = Math.cos;
  var sin = Math.sin;
  var theta = start;

  var prev = {x: h+r*cos(theta), y: k+r*sin(theta)}
  var action = new TouchAction(driver);
  action.press(prev);
  for (; theta < end; theta+=2*pi/100) {
    var next = {x: h+r*cos(theta), y: k+r*sin(theta)}
    var offset = {x: next.x-prev.x, y: next.y-prev.y}
    action.moveTo(offset);
    prev = next;
  }
  action.release();
  return action;
}

var innerArcAction = function(start, end) {
  var cos = Math.cos;
  var sin = Math.sin;
  var theta = start;

  var step = 4*pi/100;
  var min_radius = 30;

  var prev = {x: h-r*cos(theta), y: k+r*sin(theta)}
  var action = new TouchAction(driver);
  action.press(prev);
  for (; theta < end; theta+=step) {
    var rad = 7.5991*Math.pow(theta-start-pi, 2)+25;
    var next = {x: h-rad*cos(theta), y: k+rad*sin(theta)}
    var offset = {x: next.x-prev.x, y: next.y-prev.y}
    action.moveTo(offset);
    prev = next;
  }
  action.release();
  return action;
}

var multiAction = function() {
  var multi = new MultiAction();
  multi.add(
    arcAction(0, 2*pi/3*1),
    arcAction(2*pi/3*1, 2*pi/3*2),
    arcAction(2*pi/3*2, 2*pi/3*3)
  );
  return multi;
}

var innerArcMulti = function() {
  var multi = new MultiAction();
  multi.add(
    innerArcAction(2*pi/3*1 + pi/3, 2*pi/3*1 + pi + pi/8 + pi/3),
    innerArcAction(2*pi/3*2 + pi/3, 2*pi/3*2 + pi + pi/8 + pi/3),
    innerArcAction(2*pi/3*3 + pi/3, 2*pi/3*3 + pi + pi/8 + pi/3)
  );
  return multi;
}

driver.init(caps, function() {

  driver.sleep('2000', function(){
    driver.performMultiAction(multiAction(), function() {
      driver.performMultiAction(innerArcMulti());
    });
  })
});
