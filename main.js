var wd = require('wd');
var TouchAction = require('wd').TouchAction;
var MultiAction = require('wd').MultiAction;

var driver = wd.remote('localhost', 4723);
var pi = Math.PI;

var caps = {
  platformName: 'iOS',
  platformVersion: '7.1',
  deviceName: 'iPad',
  app: '/Users/jonahss/Workspace/appium/sample-code/apps/WebViewApp/build/Release-iphonesimulator/WebViewApp.app'
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

var h = 400;
var k = 400;
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

  var iterations = 0;

  var prev = {x: h+r*cos(theta), y: k+r*sin(theta)}
  var action = new TouchAction(driver);
  action.press(prev);
  for (; theta < end; theta+=2*pi/100) {
    var rad = r - (theta-start)
    var next = {x: h+rad*cos(theta), y: k+rad*sin(theta)}
    var offset = {x: next.x-prev.x, y: next.y-prev.y}
    action.moveTo(offset);
    prev = next;
    iterations++;
  }
  action.release();
  return action;
}

var multiAction = function() {
  var multi = new MultiAction();
  multi.add(
    arcAction(0, 2*pi/3*1),
    arcAction(2*pi/3*1, 2*pi/3*2),
    arcAction(2*pi/3*2, 2*pi/3*3),
    innerArcAction(0, 2*pi/3*1)
  );
  return multi;
}

driver.init(caps, function() {
  driver.elementByAccessibilityId('Enter URL', function(err, el) {
    el.sendKeys('http://lukasolson.github.io/multi-touch-draw/', function(){
      driver.elementByAccessibilityId('Go', function(err, el) {
        el.click(function (){
          driver.sleep('2000', function(){
            driver.performMultiAction(multiAction());
          })
        });
      });
    });
  })
});
